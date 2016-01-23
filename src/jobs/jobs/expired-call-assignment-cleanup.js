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
      log.info('Starting call assignment cleanup job')
      let ghostAssignments = await knex('bsd_call_assignments')
        .select('bsd_call_assignments.id')
        .leftOuterJoin('gc_bsd_events', 'bsd_call_assignments.id', 'gc_bsd_events.turn_out_assignment')
        .whereNull('turn_out_assignment')
        .where('bsd_call_assignments.renderer', 'SingleEventRSVPSurvey')
        .where('bsd_call_assignments.end_dt', '>', now)
      ghostAssignments = ghostAssignments.map((row) => row.id)
      log.info(`Expiring ${ghostAssignments.length} turn out assignments with no corresponding event.`)
      await knex('bsd_call_assignments')
        .whereIn('id', ghostAssignments)
        .update('end_dt', now)
      log.info('Clearing out target groups of expired call assignments')
      let expiredCallAssignmentGroups = await knex('bsd_call_assignments')
        .select('bsd_call_assignments.interviewee_group')
        .innerJoin('gc_bsd_groups', 'bsd_call_assignments.interviewee_group', 'gc_bsd_groups.id')
        .where('gc_bsd_groups.active', true)
        .where('bsd_call_assignments.end_dt', '<', new Date(new Date() - 3 * 60 * 60 * 1000))
      expiredCallAssignmentGroups = expiredCallAssignmentGroups.map((row) => row.interviewee_group)
      log.info(`Setting ${expiredCallAssignmentGroups.length} groups to be inactive`)
      await knex('gc_bsd_groups')
        .whereIn('id', expiredCallAssignmentGroups)
        .update('active', false)

      let inactiveGroups = await knex('gc_bsd_groups')
        .select('id')
        .where('active', false)

      inactiveGroups = inactiveGroups.map((row) => row.id)
      log.info(`Deleting group memberships for ${inactiveGroups.length} inactive groups`)
      let deletedNum = await knex('bsd_person_gc_bsd_groups')
        .whereIn('gc_bsd_group_id', inactiveGroups)
        .del()

      log.info(`Deleted ${deletedNum} rows.`)

    })

  } catch (ex) {
    log.error(ex)
  }
}
