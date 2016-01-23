import pg from 'pg'
import log from '../../backend/log'
import knex from '../../backend/data/knex'
import async from 'async'
import Promise from 'bluebird'
import importData from '../../backend/data/import-data'

export let job = async () => {
  // Durstenfeld shuffle
  let shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }
  try {
    log.info('Starting group refresh job...')

    let groups = []

    // This first transaction marks these groups as having been picked up.
    await knex.transaction(async (trx) => {
      groups = await knex('gc_bsd_groups')
        .where(function() {
          this.where('modified_dt', '<', new Date(new Date() - 24 * 60 * 60 * 1000))
            .whereRaw('extract(hour from now()) = 8')
            .where('active', true)
          })
        .orWhere('modified_dt', knex.column('create_dt'))
        .transacting(trx)

      let promises = groups.map(async (group) => {
        return knex('gc_bsd_groups')
          .where('id', group.id)
          .update({'modified_dt': new Date()})
          .transacting(trx)
      })

      return await Promise.all(promises)
    })

    await knex.transaction(async (trx) => {
      log.info(`Refreshing ${groups.length} groups...`)
      let groupCount = groups.length;
      let promises = groups.map(async (group) => {
        if (group.query !== 'everyone') {
          await knex('bsd_person_gc_bsd_groups')
            .where('gc_bsd_group_id', group.id)
            .del()
            .transacting(trx)
        }
      })
      await Promise.all(promises)

      // We do this instead of a promises map because the map takes too much memory and can kill the process
      for (let i = 0; i < groupCount; i++) {
        let group = groups[i]
        let results = null
        let limit = 100000
        let offset = 0
        let limitedQuery = null
        let query = (group.query === 'everyone') ? 'SELECT * FROM bsd_person_gc_bsd_groups' : group.query

        do {
          let shouldRandomize = query.indexOf('order by') === -1
          var shouldLimit = query.indexOf('limit') === -1
          let limitedRawQuery = query
          if (shouldRandomize)
            limitedRawQuery = limitedRawQuery + ' ORDER BY cons_id'
          if (shouldLimit)
            limitedRawQuery = `${limitedRawQuery}  LIMIT ${limit} OFFSET ${offset}`
          limitedQuery = knex
            .raw(limitedRawQuery)
            .transacting(trx)
          results = await limitedQuery

          let peopleToInsert = results.rows.map((result) => {
            return {
              cons_id: result.cons_id,
              gc_bsd_group_id: group.id,
              modified_dt: new Date(),
              create_dt: new Date()
            }
          })

          if (shouldRandomize)
            peopleToInsert = shuffleArray(peopleToInsert)

          if (peopleToInsert.length > 0) {
            await knex.bulkInsert('bsd_person_gc_bsd_groups', peopleToInsert, {transaction: trx})
          }

          offset = offset + limit
        } while(results.rows.length > 0 && shouldLimit)
      }
    })

    log.info('Done refreshing groups')
  } catch (ex) {
    log.error(ex.message, ex.stack)
  }
}
