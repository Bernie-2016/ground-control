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
      let eventsToUpdate = await knex('bsd_events')
        .innerJoin('bsd_emails', 'bsd_events.creator_cons_id', 'bsd_emails.cons_id')
        .innerJoin('gc_bsd_events', 'bsd_events.event_id', 'gc_bsd_events.event_id')
        .where('bsd_events.start_dt', '>', new Date())
        .where('gc_bsd_events.turn_out_assignment', null)
        .transacting(trx)
      let turnOutSurvey = await knex('gc_bsd_surveys')
        .innerJoin('bsd_surveys', 'bsd_surveys.signup_form_id', 'gc_bsd_surveys.signup_form_id')
        .where('bsd_surveys.signup_form_slug', 'turn-out-to-event')
        .transacting(trx)
        .first()

      if (!turnOutSurvey)
        log.error('Did not run call assignments job because there is no turn out survey to use')

      let numEvents = eventsToUpdate.length
      for (let index = 0; index < numEvents; index++) {
        let event = eventsToUpdate[index]
        let query = knex('bsd_addresses')
          .where('is_primary', true)
          .whereRaw(`st_dwithin(bsd_addresses.geom, '${event.geom}', 50000)`)
          .orderByRaw(`bsd_addresses.geom <-> '${event.geom}'`)
          .transacting(trx)
          .limit(1500)

        let intervieweeGroup = {
          query: query.toString(),
        }
        let group = await knex.insertAndFetch('gc_bsd_groups', intervieweeGroup, {transaction: trx})
        let user = await knex('users')
          .where('email', event.email)
          .first()
          .transacting(trx)
        if (!user) {
          if (event.email)
            user = await knex.insertAndFetch('users', {email: event.email,
              password: null}, {transaction: trx})
          else
            continue
        }

        let userGroup = await knex.insertAndFetch('user_groups', {
          name: `Callers for ${eventsToUpdate[index].name}`
        }, {transaction: trx})

        let userUserGroup = await knex('user_user_groups')
          .insert({
            user_id: user.id,
            user_group_id: userGroup.id
          })
          .transacting(trx)

        let callerGroup = {}
        let callAssignment = {
          name: `Turn out people to ${eventsToUpdate[index].name}`,
          gc_bsd_survey_id: turnOutSurvey.id,
          interviewee_group: group.id,
          instructions: 'Invite people near this event to attend it! Simply call the number below, tell the person about the event, and select "Yes" to the question below to automatically sign them up to attend.',
          start_dt: now,
          end_dt: moment(event.start_dt).add(1, 'days').toDate(),
          caller_group: userGroup.id,
          renderer: 'SingleEventRSVPSurvey'
        }
        callAssignment = await knex.insertAndFetch('bsd_call_assignments', callAssignment, {transaction: trx})
        await knex('gc_bsd_events')
          .where('event_id', event.event_id)
          .update({
            turn_out_assignment: callAssignment.id
          })
          .transacting(trx)
      }

      log.info('Done creating call assignments for events')
    })
  } catch (ex) {
    log.error(ex.message, ex.stack)
  }
}
