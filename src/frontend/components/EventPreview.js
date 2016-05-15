import React from 'react'
import moment from 'moment-timezone'
import {BernieText, BernieColors} from './styles/bernie-css'
import InfoHeader from './InfoHeader'
import EventOfficialStamp from './EventOfficialStamp'
import stripScripts from '../helpers/stripScripts'

const momentWithTimezone = (startDate, timeZone) => {
  return moment(startDate).tz(timeZone)
}

export default class EventPreview extends React.Component {

  render() {
    const event = this.props.event
    let formattedDateTime = momentWithTimezone(event.startDate, event.localTimezone)
    formattedDateTime = formattedDateTime ? formattedDateTime.format('LLLL') : event.startDate

    return (
      <div style={BernieText.default}>
        <h1 style={{...BernieText.title, fontSize: '2rem'}}>{event.name} {event.isOfficial ? <EventOfficialStamp /> : null}</h1>

        <InfoHeader content='Event Host' />
        <p>{event.host ? `${event.host.firstName} ${event.host.lastName}` : 'No Host Info'}</p> 

        <InfoHeader content='Event Type' />
        <p>{event.eventType.name}</p> 

        <InfoHeader content='Event Attendees' />
        <p>Venue Capacity: {(event.capacity) ? event.capacity : 'unlimited'}</p>
        <p>Number of RSVPs: {event.attendeesCount}</p>  

        <InfoHeader content='Event Description' />
        <p dangerouslySetInnerHTML={stripScripts(event.description)}></p> 

        <InfoHeader content='Event Date & Time' />
        <p>{formattedDateTime} <span style={{color: BernieColors.gray}}>{event.localTimezone} time</span></p>
        <p>Duration: {Math.floor(event.duration / 60)} hours {event.duration % 60} minutes</p>

        <InfoHeader content='Event Location' />
        <p>{event.venueName}</p>
        <p>{event.venueAddr1} {event.venueAddr2}</p>
        <p>{event.venueCity} {event.venueState}, {event.venueZip} ({event.venueCountry})</p>
        <br/>
        <p>Directions: {(event.venueDirections) ? event.venueDirections : 'None'}</p>
      </div>
    )
  }
}
