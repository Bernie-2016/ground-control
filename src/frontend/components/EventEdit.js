import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import GCForm from './forms/GCForm';
import Form from 'react-formal';
import yup from 'yup';
import moment from 'moment';
import {Card, CardActions, CardExpandable, CardTitle, CardHeader, CardText, FlatButton, TextField, DropDownMenu, SelectField, DatePicker, TimePicker, Checkbox} from 'material-ui';
import InfoHeader from './InfoHeader'
import {USTimeZones} from './data/USTimeZones';

class EventEdit extends React.Component {
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
    let event = this.props.event;
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
        .default(moment(event.startDate).toDate())
        .required(),

      localTimezone: yup.string()
        .default(event.localTimezone)
        .required(),

      duration: yup.object({
        h: yup.number()
          .default(Math.floor(event.duration / 60))
          .min(0)
          .nullable()
          .required(),

        m: yup.number()
          .default(event.duration % 60)
          .min(0).max(59)
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
      contactPhone: yup.string()
        .default(event.contactPhone)
        .required(),

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

      isSearchable: yup.string()
        .default(String(event.isSearchable)),

      flagApproval: yup.boolean()
        .default(false)

    });

    const form = (
      <GCForm
        ref="form"
        schema={eventSchema}
        defaultValue={eventSchema.default()}
        onSubmit={ (data) => {
          data.duration = data.duration.h * 60 + data.duration.m;
          data.isSearchable = Number(data.isSearchable);
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
        <br />

        <Form.Field
          name='description'
          label='Event Description'
          multiLine={true}
          fullWidth={true}
        />

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
            width: 163,
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
        {`${event.host.firstName} ${event.host.lastName}`}<br />
        {`${event.host.email}`}<br />
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
          label="Ask Attendees to Volunteer"
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
          name="flagApproval"
          label="Mark this event as incomplete/needs further review"
          onChange={(val) => {
            this.props.onFieldChanged('flagApproval', val)
          }}
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
  fragments: {
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        eventTypes {
          id
          name
        }
      }
    `
  }
})
