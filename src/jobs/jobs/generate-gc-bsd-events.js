import pg from 'pg'
import log from '../../backend/log'
import knex from '../../backend/data/knex'
import async from 'async'
import Promise from 'bluebird'
import importData from '../../backend/data/import-data'
import moment from 'moment-timezone'

export let job = async () => {
  let now = new Date()
  try {
    await knex.transaction(async (trx) => {
      let eventsToCreate = await knex('bsd_events')
        .select('bsd_events.event_id')
        .leftOuterJoin('gc_bsd_events', 'bsd_events.event_id', 'gc_bsd_events.event_id')
        .where('gc_bsd_events.event_id', null)
        .transacting(trx)
      eventsToCreate = eventsToCreate.map((event) => {
        return {
          event_id: event.event_id,
          followup_emailed: false,
          create_dt: now,
          modified_dt: now,
          pending_review: true
        }
      })

      await knex.bulkInsert('gc_bsd_events', eventsToCreate, {transaction: trx})
      log.info(`Created ${eventsToCreate.length} events!`)
    })
    log.info("Done generating gc_bsd_events!")
  } catch (ex) {
    log.error(ex)
  }
}
