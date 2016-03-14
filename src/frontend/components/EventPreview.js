import React from 'react';
import moment from 'moment-timezone';
import {BernieText, BernieColors} from './styles/bernie-css';
import InfoHeader from './InfoHeader'
import stripScripts from '../helpers/stripScripts'

const momentWithTimezone = (startDate, timeZone) => {
  return moment(startDate).tz(timeZone)
};

export default class EventPreview extends React.Component {
  constructor(props) {
    super(props);
  }

    render() {
    let event = this.props.event
    let formattedDateTime = momentWithTimezone(event.startDate, event.localTimezone)
    formattedDateTime = formattedDateTime ? formattedDateTime.format('LLLL') : event.startDate

    let isOfficial = null;
    if (event.isOfficial){
      const officialStyle = {
        display: 'inline-block',
        border: '2px solid #F55B5B',
        fontSize: '0.9rem',
        color: '#F55B5B',
        fontFamily: 'freight-sans-pro',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontWeight: '600',
        borderRadius: '3px',
        marginTop: '0.75rem',
        padding: '0.2rem 0.5rem',
        transform: 'rotate(-2deg)'
      };
      isOfficial = <span style={officialStyle}>Official Event</span>
    }
    return (
      <div>
        <h1 style={BernieText.title}>{event.name}</h1>
        {isOfficial}  

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
        <p>Capacity: {(event.capacity == 0) ? 'Unlimited' : event.capacity}</p>
        <br/>
        <p>Directions: {(event.venueDirections) ? event.venueDirections : 'None'}</p>
      </div>
    )
  }
}
