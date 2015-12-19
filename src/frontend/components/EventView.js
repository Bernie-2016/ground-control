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

let GCSelectField = ({name, floatingLabelText, selectedIndex, onChange, valueMember, menuItems, fullWidth}) => (
  <div>
    <SelectField
      selectedIndex={selectedIndex}
      floatingLabelText={floatingLabelText}
      menuItems={menuItems}
      fullWidth={fullWidth}
      floatingLabelStyle={{transform: 'perspective(1px) scale(0.75) translate3d(2px, -28px, 0)'}}
      onChange={onChange}
    />
    <input
      name={name}
      value={menuItems[selectedIndex]['payload']}
      readOnly
      // style={{display:'none'}}
    />
  </div>
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

    let event = this.props.event.node;
    event['dateTime'] = {
      startDate: moment(event.startDate),
      duration: {
        h: Math.floor(event.duration/60),
        m: event.duration % 60
      }
    };

    let eventTypeIndex = 0;
    eventTypeOptions.forEach((type, index) => {
      if (type.text == event.eventType.name){
        eventTypeIndex = index;
      }
    });

    this.state = {
      event: event,
      eventTypeIndex: eventTypeIndex
    };
  }

  renderForm() {
    let event = this.state.event;
    const defaultStr = yup.string().default('');
    const eventSchema = yup.object({
      name: yup.string().default(event.name)
        .required('An event name is required'),

      eventTypeId: yup.number()
        .default(eventTypeOptions[this.state.eventTypeIndex]['payload'])
        .required('Please select an event type'),

      description: yup.string().default(event.description)
        .required('An event description is required'),

      rsvpReminderHours: yup.number()
        .default(event.rsvpReminderHours)
        .min(0)
        .nullable(),

      startDate: yup.date()
        .default(event.dateTime.startDate.toDate())
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
        name: yup.string().default(event.venueName)
          .required('please enter a venue name'),

        addr1: yup.string().default(event.venueAddr1)
          .required('please enter an event address'),

        addr2: yup.string().default(event.venueAddr2)
          .nullable(),

        city: yup.string().default(event.venueCity)
          .required('please enter a city'),

        state: yup.string().default(event.venueState)
          .required('please enter a state'),

        zip: yup.string().default(event.venueZip)
          .required('please enter a zip code'),

        country: yup.string().default(event.venueCountry)
          .required('please enter a country'),

        directions: yup.string().default(event.venueDirections)
          .nullable(),

        capacity: yup.number()
          .default(event.capacity)
          .min(0)
          .required('please enter an event capacity'),
      }),

      contactPhone: yup.string()
        .default(event.contactPhone)
        .required('A contact phone number is required'),

      publicPhone: yup.boolean()
        .default(event.publicPhone),

      hostReceiveRsvpEmails: yup.boolean()
        .default(event.hostReceiveRsvpEmails),

      rsvpUseReminderEmail: yup.boolean()
        .default(event.rsvpUseReminderEmail),

      attendeeVolunteerShow: yup.boolean()
        .default(event.attendeeVolunteerShow),

      attendeeVolunteerMessage: yup.string()
        .default(event.attendeeVolunteerMessage),

      isSearchable: yup.boolean()
        .default((event.isSearchable == 1)),

      flagApproval: yup.boolean()
        .default(false)

    });

    const form = (
      <GCForm
        schema={eventSchema}
        defaultValue={eventSchema.default()}
        onSubmit={function(data){
          console.log(data)
        }}
        onError={function(data){console.log(data)}}
      >

        <InfoHeader content='Event Information' />

        <Form.Field
          name='name'
          floatingLabelText='Event Name'
          fullWidth={true}
        />

        <GCSelectField
          name="eventTypeId"
          floatingLabelText="Event Type"
          selectedIndex={this.state.eventTypeIndex}
          menuItems={eventTypeOptions}
          fullWidth={true}
          onChange={(event, index) => {
            this.setState({
              eventTypeIndex: index
            })
          }}
        />

        <Form.Field
          name='description'
          floatingLabelText='Event Description'
          multiLine={true}
          fullWidth={true}
        />

        <InfoHeader content='Event Date & Time' />

        <Form.Field
          name='startDate'
          minDate={new Date()}
          autoOk={true}
        />

        <Form.Field
          name='startDate'
          type='time'
          format='ampm'
          autoOk={true}
          onChange={(changeEvent, time) => {
            const updatedTime = moment(time);
            let currentDate = event.dateTime.startDate;

            currentDate.set('hour', updatedTime.get('hour'));
            currentDate.set('minute', updatedTime.get('minute'));

            this.setState({
              event: event
            })
          }}
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
        /><br/><br/>

        <Form.Field
          name="publicPhone"
          label="Make Contact Number Public"
        /><br/>

        <Form.Field
          name="hostReceiveRsvpEmails"
          label="Send Host RSVPs via Email"
        />

        <InfoHeader content='Event Attendees' />

        <Form.Field
          name="rsvpUseReminderEmail"
          label="Send Guests RSVP Email Reminder"
        />

        <Form.Field
          name='rsvpReminderHours'
          floatingLabelText="RSVP Reminder Hours"
          type='number'
          min="0"
        /><br/><br/>

        <Form.Field
          name="attendeeVolunteerShow"
          label="Ask Attendees to Volunteer"
        />

        <Form.Field
          name='attendeeVolunteerMessage'
          floatingLabelText="Message for Event Volunteers"
          multiLine={true}
          fullWidth={true}
        />

        <InfoHeader content='Event Settings' />

        <Form.Field
          name="isSearchable"
          label="Make Event Public"
        /><br/>

        <Form.Field
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
