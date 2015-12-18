import React from 'react';
import Relay from 'react-relay';
import GCForm from './forms/GCForm';
import Form from 'react-formal';
import yup from 'yup';
import moment from 'moment';
import {Card, CardActions, CardExpandable, CardTitle, CardHeader, CardText, FlatButton, TextField, DropDownMenu, SelectField, DatePicker, TimePicker, Checkbox} from 'material-ui';
import {BernieText, BernieColors} from './styles/bernie-css';

const InfoHeader = ({content}) => (
  <h3 style={BernieText.smallHeader}>{content}</h3>
);

class Event {
  constructor(bsdEvent) {
    this.node = bsdEvent;
    this.dateTime = {
      startDate: moment(bsdEvent.startDate),
      duration: {
        h: Math.floor(bsdEvent.duration/60),
        m: bsdEvent.duration % 60
      }
    };
  }
}

// Pull in valid event types and titles later
const eventTypeOptions = [
   { payload: 1, text: 'Test event 1' },
   { payload: 2, text: 'Test event 2' },
   { payload: 3, text: 'Phonebank' }
];

export class EventEdit extends React.Component {
  constructor(props) {
    super(props);
    this.setState = this.setState.bind(this);
    this.state = {
      event: new Event(this.props.eventsArray[this.props.eventIndex]['node'])
    };
  }

  renderForm() {

    const event = new Event(this.props.eventsArray[this.props.eventIndex]['node']);

    const eventTypeOpts = {
      'bsd-event-rsvper' : 'Create event RSVPs'
    };

    const defaultStr = yup.string().default('')
  
    const customerSchema = yup.object({
      name: yup.string().default(event.node.name)
        .required('An event name is required'),

      eventTypeId: yup.number().default(event.node.eventType.id)
        .required('Please select an event type'),

      description: yup.string().default(event.node.description)
        .required('An event description is required'),

      rsvpReminderHours: yup.number()
        .default(event.node.rsvpReminderHours)
        .min(0),
  
      eventDate: yup.date()
        .max(new Date(), "Are you a time traveler?!")
        .required('Please select a date'),
  
      duration: yup.object({
        h: yup.number()
          .default(event.dateTime.duration.h)
          .min(0)
          .nullable()
          .required('Please enter a number of hours'),

        m: yup.number()
          .default(event.dateTime.duration.m)
          .min(0).max(59)
          .nullable()
          .required('Please enter a number of minutes'),
      }),

      venue: yup.object({
        name: yup.string().default(event.node.venueName)
          .required('please enter a venue name'),

        addr1: yup.string().default(event.node.venueAddr1)
          .required('please enter an event address'),

        addr2: yup.string().default(event.node.venueAddr2)
          .nullable(),

        city: yup.string().default(event.node.venueCity)
          .required('please enter a city'),

        state: yup.string().default(event.node.venueState)
          .required('please enter a state'),

        zip: yup.string().default(event.node.venueZip)
          .required('please enter a zip code'),

        country: yup.string().default(event.node.venueCountry)
          .required('please enter a country'),

        directions: yup.string().default(event.node.venueDirections)
          .nullable(),

        capacity: yup.number()
          .default(event.node.capacity)
          .min(0)
          .required('please enter an event capacity'),
      }),

      contactPhone: yup.string().default(event.node.contactPhone)
        .required('A contact phone number is required'),


    });
    
    const form = (
      <GCForm
        schema={customerSchema}
        defaultValue={customerSchema.default()}
        onSubmit={function(data){console.log(data)}}
        onError={function(data){console.log(data)}}
      >
        <Form.Field
          name='name'
          floatingLabelText='Event Name'
          fullWidth={true}
        /><br />

        <Form.Field
          name='eventTypeId'
          label='Event Type'
        />

        <Form.Field
          name='description'
          floatingLabelText='Event Description'
          multiLine={true}
          fullWidth={true}
        /><br/><br/>

        <Checkbox
          label="Make Event Public"
          defaultChecked={(event.node.isSearchable == 1)}
        />

        <Form.Field
          name='rsvpReminderHours'
          floatingLabelText="RSVP Reminder Hours"
          type='number'
          min="0"
        />

        <InfoHeader content='Event Date & Time' />

        <DatePicker
          name='eventDate'
          defaultDate={event.dateTime.startDate.toDate()}
          autoOk={true}
        />

        <TimePicker
          name='startTime'
          defaultTime={event.dateTime.startDate.toDate()}
          format="ampm"
          autoOk={true}
        />

        <Form.Field
          name='duration.h'
          floatingLabelText="Duration (Hours)"
          type='number'
          min="0"
        />

        <Form.Field
          name='duration.m'
          floatingLabelText="Duration (Minutes)"
          type='number'
          min="0"
          max="59"
        />

        <InfoHeader content='Event Location' />

        <Form.Field
          name='venue.name'
          floatingLabelText='Venue Name'
        />

        <Form.Field
          name='venue.capacity'
          floatingLabelText="Venue Capacity (enter 0 for unlimited)"
          type='number'
          min="0"
        /><br/>

        <Form.Field
          name='venue.addr1'
          floatingLabelText='Address Line 1'
          fullWidth={true}
        />

        <Form.Field
          name='venue.addr2'
          floatingLabelText='Address Line 2'
          fullWidth={true}
        />

        <Form.Field
          name='venue.city'
          floatingLabelText='City'
        />

        <Form.Field
          name='venue.state'
          floatingLabelText='State'
        />

        <Form.Field
          name='venue.zip'
          floatingLabelText='Zip Code'
        />

        <Form.Field
          name='venue.country'
          floatingLabelText='Country'
        />

        <Form.Field
          name='venue.directions'
          floatingLabelText='Directions to Venue'
          multiLine={true}
          fullWidth={true}
        />

        <InfoHeader content='Event Host' />

        <Form.Field
          name="contactPhone"
          floatingLabelText="Contact Phone"
        />

        <Checkbox
          name="publicPhone"
          label="Make Contact Number Public"
          defaultChecked={event.node.publicPhone}
        /><br/>

        <Checkbox
          label="Send Host RSVPs via Email"
          defaultChecked={event.node.hostReceiveRsvpEmails}
        /><br/>

        <Checkbox
          label="Send Host RSVPs via Email"
          defaultChecked={event.node.hostReceiveRsvpEmails}
        /><br/>

        <Checkbox
          label="Send Host RSVPs via Email"
          defaultChecked={event.node.hostReceiveRsvpEmails}
        /><br/>

        <Checkbox
          label="Send Host RSVPs via Email"
          defaultChecked={event.node.hostReceiveRsvpEmails}
        /><br/>

        <Checkbox
          name="flagApproval"
          label="Mark this event as incomplete/needs further review"
        /><br/><br/>
  
      <Form.Button type='submit' label='Submit Changes' fullWidth={true} />
    </GCForm>)

    return form
  }

  render() {
    return (
    <div>
      <CardText>

        {this.renderForm()}
        
        {/*<TextField
          defaultValue={this.state.event.node.name}
          floatingLabelText="Event Name"
          fullWidth={true}
        />

        <SelectField
          value={this.state.event.node.eventType.name}
          floatingLabelText="Event Type"
          valueMember="text"
          menuItems={eventTypeOptions}
          fullWidth={true}
        />

        <TextField
          defaultValue={this.state.event.node.description}
          floatingLabelText="Event Description"
          multiLine={true}
          fullWidth={true}
        />

        <InfoHeader content='Event Date & Time' />

        <DatePicker
          defaultDate={this.state.event.dateTime.startDate}
          autoOk={true}
        />

        <TimePicker
          defaultTime={this.state.event.dateTime.startDate}
          format="ampm"
          autoOk={true}
        />

        <TextField
          defaultValue={this.state.event.dateTime.duration.h}
          floatingLabelText="Duration (Hours)"
          type="number"
          min="0"
        />

        <TextField
          defaultValue={this.state.event.dateTime.duration.m}
          floatingLabelText="Duration (Minutes)"
          type="number"
          min="0"
          max="59"
        />

        <InfoHeader content='Event Location' />

        <TextField
          defaultValue={this.state.event.node.venueName}
          floatingLabelText="Venue Name"
        />

        <TextField
          defaultValue={this.state.event.node.venueAddr1}
          floatingLabelText="Address Line 1"
        />

        <TextField
          defaultValue={this.state.event.node.venueAddr2}
          floatingLabelText="Address Line 2"
        />

        <TextField
          defaultValue={this.state.event.node.venueZip}
          floatingLabelText="Zip Code"
        />

        <TextField
          defaultValue={this.state.event.node.venueCity}
          floatingLabelText="City"
        />

        <TextField
          defaultValue={this.state.event.node.venueState}
          floatingLabelText="State"
        />

        <TextField
          defaultValue={this.state.event.node.venueCountry}
          floatingLabelText="Country"
        />

        <TextField
          defaultValue={this.state.event.node.venueDirections}
          floatingLabelText="Venue Directions"
          multiLine={true}
          fullWidth={true}
        />

        <TextField
          defaultValue={this.state.event.node.capacity}
          floatingLabelText="Venue Capacity"
          type="number"
          min="0"
        />

        <InfoHeader content='Event Attendees' />

        <Checkbox
          label="Send RSVP Reminder Emails"
          defaultChecked={this.state.event.node.rsvpUseReminderEmail}
        />

        <TextField
          defaultValue={this.state.event.node.rsvpReminderHours}
          floatingLabelText="RSVP Reminder (Hours Before)"
          type="number"
          min="0"
        />

        <Checkbox
          label="Request Volunteers"
          defaultChecked={this.state.event.node.attendeeVolunteerShow}
        />

        <TextField
          defaultValue={this.state.event.node.attendeeVolunteerMessage}
          floatingLabelText="Volunteer Message"
          multiLine={true}
          fullWidth={true}
        />

        <InfoHeader content='Event Host' />

        <TextField
          defaultValue={this.state.event.node.contactPhone}
          floatingLabelText="Contact Phone"
          type="tel"
        />

        <Checkbox
          label="Make Contact Number Public"
          defaultChecked={this.state.event.node.publicPhone}
        />

        <Checkbox
          label="Send Host RSVPs via Email"
          defaultChecked={this.state.event.node.hostReceiveRsvpEmails}
        />*/}

      </CardText>
    </div>
    )
  }
}

export class EventPreview extends React.Component {
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
        <p>{event.dateTime.startDate.format('LLLL')} <span style={{color: BernieColors.gray}}>{event.dateTime.startDate.format('llll')} local time</span></p>
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
