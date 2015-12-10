import React from 'react';
import Relay from 'react-relay';
import {Card, CardActions, CardExpandable, CardTitle, CardHeader, CardText, FlatButton, TextField, DropDownMenu, SelectField, DatePicker, TimePicker, Checkbox} from 'material-ui';
import {BernieText, BernieColors} from './styles/bernie-css';

const InfoHeader = ({content}) => (
  <h3 style={BernieText.smallHeader}>{content}</h3>
);

class Event {
  constructor(bsdEvent) {
    this.node = bsdEvent;
    this.dateTime = {
      startDate: new Date(bsdEvent.startDate),
      duration: {
        h: Math.floor(bsdEvent.duration/60),
        m: bsdEvent.duration % 60
      }
    };
  }
}

// Pull in valid event types and titles later
const eventTypeOptions = [
   { payload: 1, text: 'Test Event Type' },
   { payload: 2, text: 'Second Type' },
   { payload: 3, text: 'Really Really Long Event Type That Is Long' }
];

export class EventEdit extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let event = new Event(this.props.eventsArray[this.props.eventIndex]['node']);
    return (
    <div>
      <CardText>
        
        <TextField
          defaultValue={event.node.name}
          floatingLabelText="Event Name"
          fullWidth={true}
        />

        <SelectField
          value={event.node.eventType.name}
          floatingLabelText="Event Type"
          menuItems={eventTypeOptions}
          fullWidth={true}
        />

        <TextField
          defaultValue={event.node.description}
          floatingLabelText="Event Description"
          multiLine={true}
          fullWidth={true}
        />

        <InfoHeader content='Event Date & Time' />

        <DatePicker
          defaultDate={event.dateTime.startDate}
          autoOk={true}
        />

        <TimePicker
          defaultTime={event.dateTime.startDate}
          format="ampm"
          autoOk={true}
        />

        <TextField
          defaultValue={event.dateTime.duration.h}
          floatingLabelText="Duration (Hours)"
          type="number"
          min="0"
        />

        <TextField
          defaultValue={event.dateTime.duration.m}
          floatingLabelText="Duration (Minutes)"
          type="number"
          min="0"
          max="59"
        />

        <InfoHeader content='Event Location' />

        <TextField
          defaultValue={event.node.venueName}
          floatingLabelText="Venue Name"
        />

        <TextField
          defaultValue={event.node.venueAddr1}
          floatingLabelText="Address Line 1"
        />

        <TextField
          defaultValue={event.node.venueAddr2}
          floatingLabelText="Address Line 2"
        />

        <TextField
          defaultValue={event.node.venueZip}
          floatingLabelText="Zip Code"
        />

        <TextField
          defaultValue={event.node.venueCity}
          floatingLabelText="City"
        />

        <TextField
          defaultValue={event.node.venueState}
          floatingLabelText="State"
        />

        <TextField
          defaultValue={event.node.venueCountry}
          floatingLabelText="Country"
        />

        <TextField
          defaultValue={event.node.venueDirections}
          floatingLabelText="Venue Directions"
          multiLine={true}
          fullWidth={true}
        />

        <TextField
          defaultValue={event.node.capacity}
          floatingLabelText="Venue Capacity"
          type="number"
          min="0"
        />

        <InfoHeader content='Event Attendees' />

        <Checkbox
          label="Send RSVP Reminder Emails"
          defaultChecked={event.node.rsvpUseReminderEmail}
        />

        <TextField
          defaultValue={event.node.rsvpReminderHours}
          floatingLabelText="RSVP Reminder (Hours Before)"
          type="number"
          min="0"
        />

        <Checkbox
          label="Request Volunteers"
          defaultChecked={event.node.attendeeVolunteerShow}
        />

        <TextField
          defaultValue={event.node.attendeeVolunteerMessage}
          floatingLabelText="Volunteer Message"
          multiLine={true}
          fullWidth={true}
        />

        <InfoHeader content='Event Host' />

        <TextField
          defaultValue={event.node.contactPhone}
          floatingLabelText="Contact Phone"
          type="tel"
        />

        <Checkbox
          label="Make Contact Number Public"
          defaultChecked={event.node.publicPhone}
        />

        <Checkbox
          label="Send Host RSVPs via Email"
          defaultChecked={event.node.hostReceiveRsvpEmails}
        />

      </CardText>
    </div>
    )
  }
}

export class EventPreview extends React.Component {
  constructor(props) {
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    document.addEventListener('keydown', this.handleKeyDown);
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
    let event = new Event(this.props.eventsArray[this.props.eventIndex]['node'])
    return (
    <div>
      <CardText>
        <h1 style={BernieText.title}>{event.node.name}</h1>

        <InfoHeader content='Event Type' />
        <p>{event.node.eventType.name}</p>

        <InfoHeader content='Event Description' />
        <p>{event.node.description}</p>

        <InfoHeader content='Event Date & Time' />
        <p>{event.dateTime.startDate.toString()} <span style={{color: BernieColors.gray}}>{event.dateTime.startDate.toLocaleTimeString()} local time</span></p>
        <p>Duration: {event.dateTime.duration.h} hours {event.dateTime.duration.m} minutes</p>
        
        <InfoHeader content='Event Location' />
        <p>{event.node.venueName}</p>
        <p>{event.node.venueAddr1} {event.node.venueAddr2}</p>
        <p>{event.node.venueCity} {event.node.venueState}, {event.node.venueZip} ({event.node.venueCountry})</p>
        <br/>
        <p>Capacity: {(event.node.capacity == 0) ? 'Unlimited' : event.node.capacity}</p>
        <br/>
        <p>Directions: {(event.node.venueDirections) ? event.node.venueDirections : 'None'}</p>
      </CardText>
    </div>
    )
  }
}
