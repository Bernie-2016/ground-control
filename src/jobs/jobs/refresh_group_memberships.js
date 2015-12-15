import pg from 'pg';
import log from '../../backend/log';
import models from '../../backend/data/models'
import async from 'async';
import Promise from 'bluebird';

export let job = async () => {
  try {
    log.info('Starting group refresh job...')
    // This first transaction marks these groups as having been picked up.
    let groups = []
    await models.sequelize.transaction(async (trans) => {
        groups = await models.GCBSDGroup.findAll({
          where: {
            $or : [
              {
                modified_dt: {
                  $lt: new Date(new Date() - 24 * 60 * 60 * 1000)
                }
              },
              {
                modified_dt: {
                  $eq: models.sequelize.col('create_dt')
                }
              }
            ],
          },
          transaction: trans
        })

        let promises = groups.map(async (group) => {
          await models.GCBSDGroup.update({
            modified_dt: new Date()
          }, {
            where: {
              id: group.id
            }
          }, { transaction: trans})
        })
        return await Promise.all(promises);
    });
    await models.sequelize.transaction(async (t) => {
      let promises = groups.map(async (group) => {
        if (group.query !== 'everyone') {
          await models.BSDPersonGCBSDGroup.destroy({
            where: {
              gc_bsd_group_id: group.id
            },
            transaction: t
          })
          let results = null;
          let limit = 100000;
          let offset = 0;
          let limitedQuery = null;

          do {
            limitedQuery = `${group.query} order by cons_id limit ${limit} offset ${offset}`
            log.info('Running query: ' + limitedQuery)
            results = await models.sequelize.query(limitedQuery, {transaction: t})
            if (results && results.length > 0) {
              let persons = results[0].map((result) => result.cons_id)
              await group.addPeople(persons, {transaction: t})
              log.info('Done inserting ' + persons.length + ' rows for group ' + group.id)
            }
            offset = offset + limit;
          } while(results && results.length > 0 && results[0].length > 0)
        }
      })
      await Promise.all(promises);
      log.info('Done refreshing groups')
    })
  }
  catch (ex) {
    log.error(ex.stack)
  }
}