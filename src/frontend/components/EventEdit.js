import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import GCForm from './forms/GCForm';
import Form from 'react-formal';
import yup from 'yup';
import moment from 'moment';
import ReactQuill from 'react-quill';
import {Card, CardActions, CardExpandable, CardTitle, CardHeader, CardText, FlatButton, TextField, DropDownMenu, SelectField, DatePicker, TimePicker, Checkbox} from 'material-ui';
import InfoHeader from './InfoHeader'
import {USTimeZones} from './data/USTimeZones';

require('react-quill/node_modules/quill/dist/quill.base.css');
require('react-quill/node_modules/quill/dist/quill.snow.css');

const momentWithOffset = (startDate, utcOffset) => {
  return moment(startDate).utcOffset(utcOffset)
};

class EventEdit extends React.Component {

  componentDidMount() {
    let {email} = this.props.event.host
    this.props.relay.setVariables({personFilters: {email}})
  }

  eventTypes() {
    let allTypes = {}
    this.props.listContainer.eventTypes.forEach((eventType) => {
      allTypes[eventType.id] = eventType.name
    })
    return allTypes;
  }

  timezones() {
    let allZones = {}
    USTimeZones.forEach((zone) => {
      allZones[zone.value] = zone.name
    })
    return allZones;
  }

  volunteerShowOptions() {
    return {
      '1': 'Yes',
      '0': 'No',
      '-1': 'Use Event Type Default'
    }
  }

  eventSearchableOptions() {
    // actually get valid options for event type later
    let eventSearchableOptions = {
      '1': 'Make Public',
      '0': 'Make Private',
      '-2': 'Use Event Type Default'
    };
    return eventSearchableOptions;
  }

  renderForm() {
    let event = this.props.event
    const people = this.props.listContainer.people.edges
    const host = (people.length === 0) ? null : people[0].node
    
    const eventSchema = yup.object({
      name: yup
        .string()
        .default(event.name)
        .required(),

      eventTypeId: yup
        .string()
        .default(event.eventType.id)
        .required(),

      description: yup.string().default(event.description)
        .required(),

      rsvpEmailReminderHours: yup.number()
        .default(event.rsvpEmailReminderHours)
        .min(0)
        .nullable(),

      startDate: yup.date()
        .default(momentWithOffset(event.startDate, event.localUTCOffset).toDate())
        .required(),

      localTimezone: yup.string()
        .default(event.localTimezone)
        .required(),

      duration: yup.object({
        h: yup.number()
          .default(Math.floor(event.duration / 60))
          .min(-1)
          .nullable()
          .required(),

        m: yup.number()
          .default(event.duration % 60)
          .min(-1).max(59)
          .nullable()
          .required(),
      }),

      venueName: yup.string().default(event.venueName)
        .required(),

      venueAddr1: yup.string().default(event.venueAddr1)
        .required(),

      venueAddr2: yup.string().default(event.venueAddr2)
        .nullable(),

      venueCity: yup.string().default(event.venueCity)
        .required(),

      venueState: yup.string().default(event.venueState)
        .required(),

      venueZip: yup.string().default(event.venueZip)
        .required(),

      venueCountry: yup.string().default(event.venueCountry)
        .required(),

      venueDirections: yup.string().default(event.venueDirections)
        .nullable(),
      capacity: yup.number()
        .default(event.capacity)
        .min(0)
        .required(),

      hostEmail: yup.string().email()
        .default((event.host) ? event.host.email : null),

      contactPhone: yup.string()
        .default(event.contactPhone),

      publicPhone: yup.boolean()
        .default(event.publicPhone),

      hostReceiveRsvpEmails: yup.boolean()
        .default(event.hostReceiveRsvpEmails),

      rsvpUseReminderEmail: yup.boolean()
        .default(event.rsvpUseReminderEmail),

      attendeeVolunteerShow: yup.string()
        .default(String(event.attendeeVolunteerShow)),

      attendeeVolunteerMessage: yup.string()
        .default(event.attendeeVolunteerMessage),

      isSearchable: yup.string()
        .default(String(event.isSearchable)),

      isOfficial: yup.boolean()
        .default(event.isOfficial)

    });

    const form = (
      <GCForm
        ref="form"
        schema={eventSchema}
        defaultValue={eventSchema.default()}
        onSubmit={ (data) => {
          data.description = this.refs.quill.getEditorContents();
          data.duration = data.duration.h * 60 + data.duration.m;
          data.isSearchable = Number(data.isSearchable);
          if (host)
            data.hostId = host.id
          delete data.hostEmail

          this.props.onSubmit(data)
        }}
      >
        <InfoHeader content='Event Information' />
        <Form.Field
          name='eventTypeId'
          type='select'
          label='Event Type'
          fullWidth={true}
          choices={this.eventTypes()}
        />
        <br />
        <Form.Field
          name='name'
          label='Event Name'
          fullWidth={true}
        />
        <br /><br />

        <label>Event Description</label>
        <ReactQuill defaultValue={event.description} theme="snow" ref="quill" />

        <InfoHeader content='Event Date & Time' />

        <Form.Field
          name='startDate'
          label='Start Date/Time'
          type='datetime'
          utcOffset={event.localUTCOffset}
        />

        <Form.Field
          name='localTimezone'
          type='select'
          label='Time Zone'
          choices={this.timezones()}
          style={{
            marginTop: 5
          }}
        /><br/>

        <Form.Field
          name='duration.h'
          label="Duration (Hours)"
          type='number'
          min="0"
        />

        <Form.Field
          name='duration.m'
          label="Duration (Minutes)"
          type='number'
          min="0"
          max="59"
        />

        <InfoHeader content='Event Location' />

        <Form.Field
          name='venueName'
          label='Venue Name'
        />

        <Form.Field
          name='capacity'
          label="Venue Capacity (enter 0 for unlimited)"
          type='number'
          min="0"
        /><br/>

        <Form.Field
          name='venueAddr1'
          label='Address Line 1'
          fullWidth={true}
        />

        <Form.Field
          name='venueAddr2'
          label='Address Line 2'
          fullWidth={true}
        />

        <Form.Field
          name='venueCity'
          label='City'
        />

        <Form.Field
          name='venueState'
          label='State'
        />

        <Form.Field
          name='venueZip'
          label='Zip Code'
        />

        <Form.Field
          name='venueCountry'
          label='Country'
        />

        <Form.Field
          name='venueDirections'
          label='Directions to Venue'
          multiLine={true}
          fullWidth={true}
        />

        <InfoHeader content='Event Host' />
        {(host) ? `${host.firstName} ${host.lastName}` : 'No host name available'}<br />

        <Form.Field
          name="hostEmail"
          type="email"
          label="Host Email"
          errorText={(host) ? null : 'No account found'}
          onBlur={(value) => {
            this.props.relay.setVariables({personFilters: {email: value}})
          }}
        /><br />

        <Form.Field
          name="contactPhone"
          type="phone"
          label="Contact Phone"
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
          name='rsvpEmailReminderHours'
          label="RSVP Reminder Hours"
          type='number'
          min="0"
        /><br/><br/>

        <Form.Field
          name="attendeeVolunteerShow"
          type='select'
          label="Ask Attendees to Volunteer"
          fullWidth={true}
          choices={this.volunteerShowOptions()}
        />

        <Form.Field
          name='attendeeVolunteerMessage'
          label="Message for Event Volunteers"
          multiLine={true}
          fullWidth={true}
        />

        <InfoHeader content='Event Settings' />

        <Form.Field
          name='isSearchable'
          type='select'
          label='Make Event Public?'
          fullWidth={true}
          choices={this.eventSearchableOptions()}
        />

        <Form.Field
          name="isOfficial"
          label="Mark as an official campaign event"
        />

      <Form.Button  style={ { display: "none" } } ref="submit" type='submit' label='Submit Changes' fullWidth={true} />

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

  submit() {
    jQuery("button", ReactDOM.findDOMNode(this.refs.submit)).click()
  }
}

export default Relay.createContainer(EventEdit, {
  initialVariables: {
    personFilters: {},
  },
  fragments: {
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        eventTypes {
          id
          name
        }
        people(
          first: 1
          personFilters: $personFilters
        ) {
          edges {
            cursor
            node {
              id
              firstName
              lastName
              email
            }
          }
        }
      }
    `
  }
})
