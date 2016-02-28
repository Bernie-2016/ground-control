import pg from 'pg'
import log from '../../backend/log'
import knex from '../../backend/data/knex'
import async from 'async'
import Promise from 'bluebird'
import importData from '../../backend/data/import-data'
import moment from 'moment-timezone'
import MG from '../../backend/mail'
import unique from 'array-unique'
import rq from 'request-promise'

const Mailgun = new MG(process.env.MAILGUN_KEY, process.env.MAILGUN_DOMAIN)

export let job = async () => {

  let fourDaysFromNow = moment().add(4, 'days')
  let oneDayFromNow = moment().add(1, 'days')
  let eventsToEmail = []
  try {

    // get states to exclude.
    let req = await rq('http://googledoctoapi.forberniesanders.com/1hJadb6JyDekHf5Vzx-77h7sdJRCOB01XUPvEpKIckDs/')
    let officeLocations = JSON.parse(req);
    let officeStates = unique(officeLocations.map((office) => office['state']))

    await knex.transaction(async (trx) => {

      var eventsSql =

          "SELECT " +
            "gc_bsd_events.event_id " +
          "FROM " +
            "gc_bsd_events " +
          "INNER JOIN " +
              "bsd_events " +
            "ON " +
              "gc_bsd_events.event_id = bsd_events.event_id " +
          "WHERE " +
              "gc_bsd_events.event_id " +
            "IN " +
              "( " +
                "SELECT " +
                  "bsd_events.event_id " +
                "FROM " +
                  "bsd_events " +
                "INNER JOIN " +
                    "gc_bsd_events " +
                  "ON bsd_events.event_id = gc_bsd_events.event_id " +
                "INNER JOIN " +
                    "bsd_event_attendees " +
                  "ON bsd_events.event_id = bsd_event_attendees.event_id " +
                "WHERE " +
                    "bsd_events.event_type_id = 31 " +
                  "AND " +
                    "bsd_events.start_dt > \'" + oneDayFromNow.startOf('day').format('YYYY-MM-DD HH:mm:ss') + "\' " +
                  "AND " +
                    "bsd_events.start_dt < \'" + fourDaysFromNow.endOf('day').format('YYYY-MM-DD HH:mm:ss') + "\' " +
                  "AND " +
                     "gc_bsd_events.create_dt < \'" + moment().startOf('day').format('YYYY-MM-DD HH:mm:ss') + "\' " +
                  "AND " +
                    "bsd_events.capacity > 2 " +
                  "AND " +
                    "bsd_events.flag_approval = false " +
                  "AND " +
                    "gc_bsd_events.fast_fwd_instructions_sent = false " +
                  "AND " +
                    "bsd_events.venue_state_cd NOT IN (\'" + officeStates.join('\', \'') + "\') " +
                "GROUP BY " +
                    "bsd_events.event_id " +
                  "HAVING " +
                    "(COUNT(event_attendee_id) * 100)::numeric / bsd_events.capacity < 50 " +
              ") " +

          "UNION " +

            "SELECT " +
              "bsd_events.event_id " +
            "FROM " +
              "bsd_events " +
            "INNER JOIN " +
                "gc_bsd_events " +
              "ON " +
                "bsd_events.event_id = gc_bsd_events.event_id " +
            "WHERE " +
                "bsd_events.event_type_id = 31 " +
              "AND " +
                "bsd_events.capacity = 0 " +
              "AND " +
                "bsd_events.start_dt > \'" + oneDayFromNow.startOf('day').format('YYYY-MM-DD HH:mm:ss') + "\' " +
              "AND " +
                "bsd_events.start_dt < \'" + fourDaysFromNow.endOf('day').format('YYYY-MM-DD HH:mm:ss') + "\' " +
              "AND " +
                 "gc_bsd_events.create_dt < \'" + moment().startOf('day').format('YYYY-MM-DD HH:mm:ss') + "\' " +
              "AND " +
                "bsd_events.flag_approval = false " +
              "AND " +
                "gc_bsd_events.fast_fwd_instructions_sent = false " +
              "AND " +
                "bsd_events.venue_state_cd NOT IN (\'" + officeStates.join('\', \'') + "\')";

      eventsToEmail = await knex.raw(eventsSql).transacting(trx);

      await knex.table('gc_bsd_events')
        .update('fast_fwd_instructions_sent', true)
        .whereIn('event_id', eventsToEmail.rows.map((event) => event.event_id))
        .transacting(trx)

    })
    log.info(`Sending email to ${eventsToEmail.rows.length} events`)
    let promises = eventsToEmail.rows.map(async (event) => {
      return Mailgun.sendFastFwdInstructions(event.event_id)
    })
    await Promise.all(promises)
    log.info('Done sending e-mails!')
  } catch (ex) {
    log.error(ex)
  }
}
