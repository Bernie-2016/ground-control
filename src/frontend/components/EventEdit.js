import React from 'react';
import Relay from 'react-relay';
import GCForm from './forms/GCForm';
import Form from 'react-formal';
import yup from 'yup';
import moment from 'moment';
import {Card, CardActions, CardExpandable, CardTitle, CardHeader, CardText, FlatButton, TextField, DropDownMenu, SelectField, DatePicker, TimePicker, Checkbox} from 'material-ui';
import GCSelectField from './forms/GCSelectField'
import InfoHeader from './InfoHeader'

export default class EventEdit extends React.Component {

  renderForm() {
    let event = this.props.event;
    const defaultStr = yup.string().default('');
    const eventSchema = yup.object({
      name: yup
        .string()
        .default(event.name)
        .required(),

      eventTypeId: yup.number()
        .default(1)
        .required('Please select an event type'),

      description: yup.string().default(event.description)
        .required('An event description is required'),

      rsvpReminderHours: yup.number()
        .default(event.rsvpReminderHours)
        .min(0)
        .nullable(),

      startDate: yup.date()
        .default(moment(event.startDate).toDate())
        .required('Please select a date'),

      duration: yup.object({
        h: yup.number()
          .default(Math.floor(event.duration / 60))
          .min(0)
          .nullable()
          .required('Please enter a number of hours'),

        m: yup.number()
          .default(event.duration % 60)
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
      >

        <InfoHeader content='Event Information' />

        <Form.Field
          name='name'
          label='Event Name'
        />

        <Form.Field
          name='description'
          label='Event Description'
          multiLine={true}
          fullWidth={true}
        />

        <InfoHeader content='Event Date & Time' />

        <Form.Field
          name='startDate'
          label='Start Date'
          minDate={new Date()}
          autoOk={true}
        />

        <Form.Field
          name='startDate'
          label='Start Time'
          type='time'
          format='ampm'
          autoOk={true}
        />

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
          name='venue.name'
          label='Venue Name'
        />

        <Form.Field
          name='venue.capacity'
          label="Venue Capacity (enter 0 for unlimited)"
          type='number'
          min="0"
        /><br/>

        <Form.Field
          name='venue.addr1'
          label='Address Line 1'
          fullWidth={true}
        />

        <Form.Field
          name='venue.addr2'
          label='Address Line 2'
          fullWidth={true}
        />

        <Form.Field
          name='venue.city'
          label='City'
        />

        <Form.Field
          name='venue.state'
          label='State'
        />

        <Form.Field
          name='venue.zip'
          label='Zip Code'
        />

        <Form.Field
          name='venue.country'
          label='Country'
        />

        <Form.Field
          name='venue.directions'
          label='Directions to Venue'
          multiLine={true}
          fullWidth={true}
        />

        <InfoHeader content='Event Host' />

        <Form.Field
          name="contactPhone"
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
          name='rsvpReminderHours'
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