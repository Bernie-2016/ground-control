import knex from '../../backend/data/knex'
import log from '../../backend/log'
import request from 'request-promise'
import BSDClient from '../../backend/bsd-instance'

export const job = async () => {
	if(process.env.NODE_ENV == 'production') {
		log.info('Running moderate problem events job...')
		try {
			const events = await knex('bsd_events').select('*')
				.innerJoin('bsd_emails', 'bsd_events.creator_cons_id', 'bsd_emails.cons_id')
				.join('event_host_moderation_advisory', 'bsd_emails.email', 'event_host_moderation_advisory.email')
				.where('bsd_events.flag_approval', false)

			events.forEach((event) => {
				BSDClient.updateEvent({...event, flag_approval: true})
			})

			log.info(`Moderated ${events.length} event(s)`)
		}
		catch (e){
			log.error('Failed to moderate events')
			log.error(JSON.stringify(e))
		}
	}
}
