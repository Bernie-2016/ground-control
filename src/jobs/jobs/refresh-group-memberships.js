import pg from 'pg';
import log from '../../backend/log';
import knex from '../../backend/data/knex'
import async from 'async';
import Promise from 'bluebird';

export let job = async () => {
  try {
    log.info('Starting group refresh job...')
    // This first transaction marks these groups as having been picked up.
    let groups = []
    await knex.transaction(async (trx) => {
      groups = await knex('gc_bsd_groups')
        .where('modified_dt', '<', new Date(new Date() - 24 * 60 * 60 * 1000))
        .orWhere('modified_dt', knex.column('create_dt'))
        .transacting(trx)
      let promises = groups.map(async (group) => {
        return knex('gc_bsd_groups')
          .where('id', group.id)
          .update({'modified_dt': new Date()})
          .transacting(trx)
      })
      return await Promise.all(promises);
    });

    await knex.transaction(async(trx) => {
      let promises = groups.map(async (group) => {
        if (group.query !== 'everyone') {
          await knex('bsd_person_gc_bsd_groups')
            .where('gc_bsd_group_id', group.id)
            .del()
            .transacting(trx)
        }
        let results = null;
        let limit = 100000;
        let offset = 0;
        let limitedQuery = null;
        do {
          limitedQuery = knex.raw(`${group.query} order by cons_id limit ${limit} offset ${offset}`).transacting(trx)
          log.info('Running query: ' + limitedQuery.toString())
          results = await limitedQuery;
          let peopleToInsert = results.rows.map((result) => {
            return {
              cons_id: result.cons_id,
              gc_bsd_group_id: group.id,
              modified_dt: new Date(),
              create_dt: new Date()
            }
          })
          await knex('bsd_person_gc_bsd_groups')
            .insert(peopleToInsert)
            .transacting(trx)
          log.info('Done inserting ' + peopleToInsert.length + ' rows for group ' + group.id)
          offset = offset + limit
        } while(results.rows.length > 0)
      })
      await Promise.all(promises);
      log.info('Done refreshing groups')
    })
  }
  catch (ex) {
    log.error(ex.stack)
  }
}