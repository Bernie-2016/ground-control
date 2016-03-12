import React from 'react'
import Relay from 'react-relay'
import {BernieColors, BernieText} from './styles/bernie-css'
import {Paper, Slider, Toggle, Styles} from 'material-ui'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import EventPreview from './EventPreview'
import MutationHandler from './MutationHandler'
import CreateFastFwdRequest from '../mutations/CreateFastFwdRequest'
import yup from 'yup'
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider'
import {BernieTheme} from './styles/bernie-theme';

const publicEventsRootUrl = 'https://secure.berniesanders.com/page/event/detail/'

class FastFwdForm extends React.Component {
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
    hostMessage: yup.string().required(),
  })

  state = {
    testMode: false,
    recipientLimit: null
  }

  render() {

    if (!this.props.event)
      return <div style={{ textAlign: 'center', marginTop: '4em'}}>
                <h1 style={BernieText.title}>Invalid Event</h1>
                <p style={BernieText.default}>This event does not exist. If you've just recently created your event.
                this error may resolve itself in a short period of time. It's also
                possible your event was deleted. Please email <a href="mailto:help@berniesanders.com">help@berniesanders.com</a> if you need help.</p>
              </div>


    let event_type_name = 'volunteer event';

    if(this.props.event.eventType.name.toLowerCase().indexOf('phone bank') > -1){
      event_type_name = 'phone bank party'
    }

    if(this.props.event.eventType.name.toLowerCase().indexOf('barnstorm') > -1){
      event_type_name = 'Barnstorm event'
    }

    let defaultHostMessage = this.props.event.fastFwdRequest ? this.props.event.fastFwdRequest.hostMessage :
                            "Hello, neighbors!\n\nI'm hosting a " + event_type_name +
                            " and I need a few more Bernie supporters " +
                            "to attend to make this event a big success. " +
                            "Will you please attend my event?\n\n" +
                            publicEventsRootUrl + this.props.event.eventIdObfuscated + "\n\n" +
                            "Thank you,\n\n" +
                            (this.props.event.host ? this.props.event.host.firstName: "")

    return (
      <MuiThemeProvider muiTheme={Styles.getMuiTheme(BernieTheme)}>
        <div style={this.styles.pageContainer}>
          <MutationHandler ref='mutationHandler'
                           successMessage='Your message has been saved.'
                           mutationClass={CreateFastFwdRequest}
                           mutationName='createFastFwdRequest' />
          <div style={BernieText.title}>
            Fast Fwd: Send a message to bring volunteers to your event
          </div>

          <Paper zDepth={1} style={this.styles.detailsContainer}>
            <p style={BernieText.secondaryTitle}>Your Event Details:</p>
            <EventPreview event={this.props.event} />
          </Paper>

          <Paper zDepth={2} style={this.styles.formContainer}>
            <GCForm
              schema={this.formSchema}
              defaultValue={{
                hostMessage: this.props.event.hostMessage || defaultHostMessage
              }}
              onSubmit={(formValues) => {
                this.refs.mutationHandler.send({
                  eventId: this.props.event.id,
                  ...formValues
                })
              }}
            >
              <p style={BernieText.inputLabel}>Author a message below about your event and why people should come out.
                We'll forward it on to potential attendees in your area.</p>
              <Form.Field
                name='hostMessage'
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
      </MuiThemeProvider>
    )
  }
}

export default Relay.createContainer(FastFwdForm, {
  fragments: {
    currentUser: () => Relay.QL`
      fragment on User {
        id
        email
      }
    `,
    event: () => Relay.QL`
      fragment on Event {
        attendeesCount
        attendeeVolunteerMessage
        attendeeVolunteerShow
        fastFwdRequest{
          hostMessage
        }
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
