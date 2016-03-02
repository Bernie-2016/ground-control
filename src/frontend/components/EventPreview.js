import React from 'react';
import Relay from 'react-relay';
import GCForm from './forms/GCForm';
import Form from 'react-formal';
import yup from 'yup';
import moment from 'moment';
import {Card, CardActions, CardExpandable, CardTitle, CardHeader, CardText, FlatButton, TextField, DropDownMenu, SelectField, DatePicker, TimePicker, Checkbox} from 'material-ui';
import {BernieText, BernieColors} from './styles/bernie-css';
import GCSelectField from './forms/GCSelectField'
import InfoHeader from './InfoHeader'

const momentWithOffset = (startDate, utcOffset) => {
  return moment(startDate).utcOffset(utcOffset)
};

export default class EventPreview extends React.Component {
  constructor(props) {
    super(props)
  }

  stripScripts = (s) => {
    let div = document.createElement('div');
    div.innerHTML = s;
    let scripts = div.getElementsByTagName('script');
    let i = scripts.length;
    while (i--) {
      scripts[i].parentNode.removeChild(scripts[i]);
    }
    return {__html: div.innerHTML}
  }

  renderHost() {
    if (this.props.event.host)
      return (
        <div>
          <InfoHeader content='Event Host' />
          <p>{`${this.props.event.host.firstName} ${this.props.event.host.lastName}`}</p>
        </div>
      )
    return null
  }

  render() {
    let event = this.props.event
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
        <CardText>
          <h1 style={BernieText.title}>{event.name}</h1>
          {isOfficial}

          {this.renderHost()}

          <InfoHeader content='Event Type' />
          <p>{event.eventType.name}</p>

          <InfoHeader content='Event Attendees' />
          <p>Venue Capacity: {(event.capacity) ? event.capacity : 'unlimited'}</p>
          <p>Number of RSVPs: {event.attendeesCount}</p>

          <InfoHeader content='Event Description' />
          <p dangerouslySetInnerHTML={this.stripScripts(event.description)}></p>

          <InfoHeader content='Event Date & Time' />
          <p>{momentWithOffset(event.startDate, event.localUTCOffset).format('LLLL')} <span style={{color: BernieColors.gray}}>{event.localTimezone} time</span></p>
          <p>Duration: {Math.floor(event.duration / 60)} hours {event.duration % 60} minutes</p>

          <InfoHeader content='Event Location' />
          <p>{event.venueName}</p>
          <p>{event.venueAddr1} {event.venueAddr2}</p>
          <p>{event.venueCity} {event.venueState}, {event.venueZip} ({event.venueCountry})</p>
          <br/>
          <p>Capacity: {(event.capacity == 0) ? 'Unlimited' : event.capacity}</p>
          <br/>
          <p>Directions: {(event.venueDirections) ? event.venueDirections : 'None'}</p>
        </CardText>
      </div>
    )
  }
}
