import knex from '../../backend/data/knex'
import request from 'request-promise'
import BSDClient from '../../backend/bsd-instance'

export let job = async () => {

    if(process.env.NODE_ENV == 'production'){

        try{

            const emailsToBan = (await request({'uri': 'https://sheetsu.com/apis/' + process.env.EVENTS_MODERATION_ADVISORY_SHEET + '/column/Email',
                                                'json': true})).result

            const events = await knex('bsd_events').select('bsd_events.event_id')
                            .innerJoin('bsd_emails', 'bsd_events.creator_cons_id', 'bsd_emails.cons_id')
                            .whereIn('bsd_emails.email', emailsToBan)

            const eventIdsToDelete = events.map((event) => event.event_id)

            if(eventIdsToDelete.length > 0){
                BSDClient.deleteEvents(eventIdsToDelete)
                await knex('bsd_events')
                      .whereIn('event_id', eventIdsToDelete)
                      .del()
                console.log('Successfully deleted ' + eventIdsToDelete.length + ' events.')
            } else {
                console.log('No events to delete!');
            }


        } catch (e){
            console.log('Failed to delete offending events')
            console.log(e.message)
        }

    }
}