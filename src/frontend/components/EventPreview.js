import React from 'react';
import Relay from 'react-relay';
import GCForm from './forms/GCForm';
import Form from 'react-formal';
import yup from 'yup';
import moment from 'moment-timezone';
import {Card, CardActions, CardExpandable, CardTitle, CardHeader, CardText, FlatButton, TextField, DropDownMenu, SelectField, DatePicker, TimePicker, Checkbox} from 'material-ui';
import {BernieText, BernieColors} from './styles/bernie-css';
import GCSelectField from './forms/GCSelectField'
import InfoHeader from './InfoHeader'
import stripScripts from '../helpers/stripScripts'

const momentWithTimezone = (startDate, timeZone) => {
  return moment(startDate).tz(timeZone)
};

export default class EventPreview extends React.Component {
  constructor(props) {
    super(props);
    // this.handleKeyDown = this.handleKeyDown.bind(this);
    // document.addEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(event){
    switch(event.keyIdentifier){
      case 'Down':
      case 'Right':
        // View next event
        this.props.onChangeEventIndex(1);
        break;
      case 'Up':
      case 'Left':
        // View previous event
        this.props.onChangeEventIndex(-1);
        break;
      case 'U+0041':
        // 'A' was pressed; approve and move to next event
        this.props.onEventConfirm([this.props.eventIndex]);
        break;
      case 'U+0045':
        // 'E' was pressed; open edit tab
        this.props.onTabRequest(this.props.eventIndex, 1);
        break;
      case 'U+0050':
        // 'P' was pressed; open preview tab
        this.props.onTabRequest(this.props.eventIndex, 0);
        break;
      case 'U+0044':
        // 'D' was pressed; delete this event
        this.props.onEventDelete([this.props.eventIndex]);
        break;
      default:
        //Statements executed when none of the values match the value of the expression
        console.log(event.keyIdentifier);
        break;
    }
  }

  componentWillUnmount(){
    document.removeEventListener('keydown', this.handleKeyDown);
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
          <p>{momentWithTimezone(event.startDate, event.localTimezone).format('LLLL')} <span style={{color: BernieColors.gray}}>{event.localTimezone} time</span></p>
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
