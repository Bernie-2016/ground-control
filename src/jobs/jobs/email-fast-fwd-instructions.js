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
  // let fourDaysFromNow = moment().add(4, 'days')
  // let eventsToEmail = []
  // try {
  //   await knex.transaction(async (trx) => {
  //     eventsToEmail = await knex('gc_bsd_events')
  //       .select('gc_bsd_events.event_id')
  //       .select(function(){
  //           knex('bsd_event_attendees').where('event_id', event.event_id).count('event_attendee_id');

  //       })
  //           knex.raw('attendee_count / bsd_events.capacity'))
  //       .innerJoin('bsd_events', 'gc_bsd_events.event_id', 'bsd_events.event_id')
  //       .where(function(){
  //         this
  //         .where('bsd_events.capacity' > 2 and 'capacity_percentage' < 0.5)
  //         .orWhere('bsd_events.capacity' = 0)
  //       })
  //       .where('gc_bsd_events.fast_fwd_instructions_sent', false)
  //       .where('bsd_events.event_type_id', 31)
  //       .where('bsd_events.start_dt', '>', fourDaysFromNow.startOf('day'))
  //       .where('bsd_events.start_dt', '<', fourDaysFromNow.endOf('day'))
  //       .where('bsd_events.flag_approval', false)
  //       .transacting(trx)
  //     await knex('gc_bsd_events')
  //       .whereIn('event_id', eventsToEmail.map((event) => event.event_id))
  //       .update('fast_fwd_instructions_sent', true)
  //       .transacting(trx)
  //   })
  //   log.info(`Sending email to ${eventsToEmail.length} events`)
  //   let promises = eventsToEmail.map(async (event) => {
  //     return Mailgun.sendFastFwdInstructions(event.event_id)
  //   })
  //   await Promise.all(promises)
  //   log.info('Done sending e-mails!')
  // } catch (ex) {
  //   log.error(ex)
  // }
}
