import pg from 'pg'
import log from '../../backend/log'
import knex from '../../backend/data/knex'
import async from 'async'
import Promise from 'bluebird'
import importData from '../../backend/data/import-data'
import moment from 'moment-timezone'
import MG from '../../backend/mail'

const Mailgun = new MG(process.env.MAILGUN_KEY, process.env.MAILGUN_DOMAIN)

export let job = async () => {
  let now = new Date()
  let eventsToEmail = []
  try {
    await knex.transaction(async (trx) => {
      eventsToEmail = await knex('gc_bsd_events')
        .select('gc_bsd_events.event_id')
        .innerJoin('bsd_events', 'gc_bsd_events.event_id', 'bsd_events.event_id')
        .where('gc_bsd_events.followup_emailed', false)
        .whereNotNull('gc_bsd_events.turn_out_assignment')
        .where('bsd_events.start_dt', '>', now)
        .where('bsd_events.flag_approval', false)
        .transacting(trx)
      await knex('gc_bsd_events')
        .whereIn('event_id', eventsToEmail.map((event) => event.event_id))
        .update('followup_emailed', true)
        .transacting(trx)
    })
    log.info(`Sending email to ${eventsToEmail.length} events`)
    let promises = eventsToEmail.map(async (event) => {
      return Mailgun.sendEventInstructions(event.event_id)
    })
    await Promise.all(promises)
  } catch (ex) {
    log.error(ex.message, ex.stack)
  }
}
