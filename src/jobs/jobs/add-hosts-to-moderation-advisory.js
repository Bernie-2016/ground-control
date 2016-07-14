import knex from '../../backend/data/knex'
import log from '../../backend/log'
import request from 'request-promise'

export const job = async () => {
	if(process.env.NODE_ENV == 'production') {
		log.info('Running sync moderated hosts job...')
		try {
			const options = {
			  uri: `https://sheetsu.com/apis/${process.env.EVENTS_MODERATION_ADVISORY_SHEET}/column/Email`,
			  method: 'GET',
			  json: true
			}
			const emailsToModerate = await request(options)
			const moderatedHosts = await knex('event_host_moderation_advisory').select('email')
			const moderatedEmails = new Set(moderatedHosts.map((row) => row.email))
			const emailsToInsert = emailsToModerate.result
				.filter((email) => !moderatedEmails.has(email))
				.map((email) => {return {email}})

			await knex.bulkInsert('event_host_moderation_advisory', emailsToInsert)
			log.info(`Added ${emailsToInsert.length} host email(s) for moderation.`)
		}
		catch (e){
			log.error('Failed to sync moderated event hosts.')
			log.error(JSON.stringify(e))
		}
	}
}
