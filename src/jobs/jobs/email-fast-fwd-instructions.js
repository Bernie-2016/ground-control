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
  let fourDaysFromNow = moment().add(4, 'days')
  let eventsToEmail = []
  try {

    await knex.transaction(async (trx) => {

      eventsToEmail = await knex.table('gc_bsd_events')
      
          // find < 2 capacity events, less than half full
          .select('gc_bsd_events.event_id')
          .select(function(){
              knex.table('bsd_event_attendees')
                .select(knex.raw('(COUNT(event_attendee_id) * 100)::numeric / bsd_events.capacity as capacity_percentage'))
                .innerJoin('bsd_events', 'gc_bsd_events.event_id', 'bsd_events.event_id')
                .innerJoin('bsd_event_attendees', 'bsd_events.event_id', 'bsd_event_attendees.event_id')
                .where()
                .groupBy('bsd_events.event_id')
          })
          .innerJoin('bsd_events', 'gc_bsd_events.event_id', 'bsd_events.event_id')
          .where('bsd_events.event_type_id', 31)
          .where('bsd_events.start_dt', '>', fourDaysFromNow.startOf('day'))
          .where('bsd_events.start_dt', '<', fourDaysFromNow.endOf('day'))
          .where('bsd_events.capacity' > 2 and 'capacity_percentage' < 0.5)
          .where('bsd_events.flag_approval', false)
          .where('gc_bsd_events.fast_fwd_instructions_sent', false)

        // find 0 capacity events.
        .union(function(){
          this.table('gc_bsd_events')
            .select('gc_bsd_events.event_id')
            .innerJoin('bsd_Events', 'gc_bsd_events.event_id', 'bsd_events.event_id')
            .where('bsd_events.event_type_id', 31)
            .where('bsd_events.start_dt', '>', fourDaysFromNow.startOf('day'))
            .where('bsd_events.start_dt', '<', fourDaysFromNow.endOf('day'))
            .where('bsd_events.capacity' = 0)
            .where('bsd_events.flag_approval', false)
            .where('gc_bsd_events.fast_fwd_instructions_sent', false)
        })
        .transacting(trx)

      await knex('gc_bsd_events')
        .whereIn('event_id', eventsToEmail.map((event) => event.event_id))
        .update('fast_fwd_instructions_sent', true)
        .transacting(trx)
    })
    log.info(`Sending email to ${eventsToEmail.length} events`)
    let promises = eventsToEmail.map(async (event) => {
      return Mailgun.sendFastFwdInstructions(event.event_id)
    })
    await Promise.all(promises)
    log.info('Done sending e-mails!')
  } catch (ex) {
    log.error(ex)
  }
}
