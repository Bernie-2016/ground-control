import React from 'react'
import Relay from 'react-relay'
import {BernieColors, BernieText} from './styles/bernie-css'
import {Paper, Slider, Toggle} from 'material-ui'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import EventPreview from './EventPreview'
import MutationHandler from './MutationHandler'
import CreateBoostAttendanceRequest from '../mutations/CreateBoostAttendanceRequest'
import yup from 'yup'

class BoostEventAttendanceForm extends React.Component {
  styles = {
    detailsContainer: {
      float: 'left',
      marginTop: '1rem',
      padding: 10,
      width: 480
    },

    formContainer: {
      float: 'left',
      width: 380,
      paddingLeft: 15,
      paddingRight: 15,
      paddingTop: 15,
      paddingBottom: 15,
      marginTop: 15,
      marginLeft: '2rem',
      border: 'solid 1px ' + BernieColors.lightGray
    },

    pageContainer: {
      marginLeft: '7rem',
      marginTop: '1rem'
    }
  }

  formSchema = yup.object({
    host_message: yup.string().required(),
  })

  state = {
    testMode: false,
    recipientLimit: null
  }

  render() {

    console.log('from render method');
    console.log(this.props);
    console.log(this.props.event);

    let default_host_message = this.props.event.boostAttendanceRequest.host_message ||
                            "Hello, neighbors!\n\nI'm hosting a " +
                            this.props.event.eventType.name +
                            " and I need a few more Bernie supporters " +
                            "to attend to make this event a big success. " + 
                            "Will you please attend my event?\n\nThank you,\n\n" +
                            this.props.event.host.firstName

    return (
      <div style={this.styles.pageContainer}>
        <MutationHandler ref='mutationHandler'
                         successMessage='Event email sent!'
                         mutationClass={CreateBoostAttendanceRequest}
                         mutationName='createBoostAttendanceRequest' />
        <div style={BernieText.title}>
          Boost Attendance at your Event
        </div>

        <Paper zDepth={1} style={this.styles.detailsContainer}>
          <p style={BernieText.secondaryTitle}>Your Event Details:</p>
          <EventPreview event={this.props.event} />
        </Paper>

        <Paper zDepth={2} style={this.styles.formContainer}>
          <GCForm
            schema={this.formSchema}
            defaultValue={{
              host_message: this.props.host_message || default_host_message
            }}
            onSubmit={(formValues) => {
              this.refs.mutationHandler.send({
                listContainer: this.props.listContainer,
                event_id: this.props.event.id,
                ...formValues
              })
            }}
          >
            <p style={BernieText.inputLabel}>Author a message below about your event and why people should come out.
              We'll forward it on to potential attendees in your area.</p>
            <Form.Field
              name='host_message'
              multiLine={true}
              rows={12}
              label="Message From Host"
            />
            <br />
            <br />
            <Form.Button type='submit' label='Submit' fullWidth={true} />
          </GCForm>
        </Paper>
      </div>
    )
  }
}

export default Relay.createContainer(BoostEventAttendanceForm, {
  fragments: {
    currentUser: () => Relay.QL`
      fragment on User {
        id
        email
      }
    `,
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        ${CreateBoostAttendanceRequest.getFragment('listContainer')},
      }
    `,
    event: () => Relay.QL`
      fragment on Event {
        attendeesCount
        attendeeVolunteerMessage
        attendeeVolunteerShow
        boostAttendanceRequest
        capacity
        contactPhone
        createDate
        description
        duration        
        eventIdObfuscated
        eventType {
          id
          name
        }
        flagApproval
        host {
          id
          firstName
          lastName
          email
        }
        hostReceiveRsvpEmails
        id
        isSearchable
        latitude
        localTimezone
        localUTCOffset
        longitude
        name
        nearbyPeople {
          id
          firstName
          lastName
          email
        }
        publicPhone
        rsvpEmailReminderHours
        rsvpUseReminderEmail
        startDate
        venueAddr1
        venueAddr2
        venueCity
        venueCountry
        venueDirections
        venueName
        venueState
        venueZip
      }
    `
  }
})
