import React from 'react'
import Relay from 'react-relay'
import {BernieColors, BernieText} from './styles/bernie-css'
import {Paper, Slider, Toggle} from 'material-ui'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import EventPreview from './EventPreview'
import MutationHandler from './MutationHandler'
import CreateAdminEventEmail from '../mutations/CreateAdminEventEmail'
import yup from 'yup'
import moment from 'moment';

const momentWithOffset = (startDate, utcOffset) => {
  return moment(startDate).utcOffset(utcOffset)
};

class AdminEventEmailCreationForm extends React.Component {
  styles = {
    detailsContainer: {
      float: 'left',
      marginLeft: '2rem',
      marginTop: '1rem',
      padding: 10,
      width: 380
    },

    recipientInfoContainer: {
      float: 'left',
      marginLeft: '2rem',
      marginTop: '1rem',
      padding: 30,
      width: 380
    },

    formContainer: {
      float: 'left',
      width: 380,
      paddingLeft: 15,
      paddingRight: 15,
      paddingTop: 15,
      paddingBottom: 15,
      marginTop: 15,
      border: 'solid 1px ' + BernieColors.lightGray
    },

    pageContainer: {
      marginLeft: '7rem',
      marginTop: '1rem'
    }
  }

  formSchema = yup.object({
    hostEmail: yup.string().email().required(),
    senderEmail: yup.string().email().required(),
    hostMessage: yup.string().required(),
    senderMessage: yup.string().required(),
    toolPassword: yup.string().required()
  })

  state = {
    testMode: false,
    recipientLimit: null
  }

  getRandomSubarray(arr, size) {
    let shuffled = arr.slice(0), i = arr.length, temp, index

    while (i--) {
      index = Math.floor((i + 1) * Math.random())
      temp = shuffled[index]
      shuffled[index] = shuffled[i]
      shuffled[i] = temp
    }

    return shuffled.slice(0, size)
  }

  getSenderMessage(event) {
      const eventDate = momentWithOffset(event.startDate, event.localUTCOffset).format('LLLL');
      const messageTemplates = [
`${event.host.firstName} in ${event.venueCity} is hosting an event on ${eventDate} and needs more people to sign up. Hope you can make it -- here's a link to the event: ${event.link}`,

`Hey, are you free on ${eventDate}? ${event.host.firstName} in ${event.venueCity} is hosting an event on for Bernie and needs more people to sign up. Here's a link to the event: ${event.link}`,

`There's a great Bernie volunteer event coming up near you on ${eventDate}. ${event.host.firstName} asked me to pass along the message below -- they need more people to sign up. 
Here's a link where you can RSVP and get more info: ${event.link}`,

`${event.host.firstName} in ${event.venueCity} made a special request that I forward on the message below to Bernie supporters nearby. Can you come to a volunteer event on ${eventDate}? 
Here's a link to sign up and get more info: ${event.link}`,

`I don't usually do this, but ${event.host.firstName} has asked me to send out a special request to recruit more RSVPs for a Bernie volunteer event in ${event.venueCity} on ${eventDate}. Can you join in? 
Here's a link where you can get more info and sign up: ${event.link}`,

`When people in the Bernie movement put out a call for help, we try to answer it. ${event.host.firstName} has asked for some help getting people to a volunteer event on ${eventDate}. Can you join in? 
RSVP and get more info here: ${event.link}`,

`A local volunteer in ${event.venueCity} has asked for help to fill up her event. Let's blow ${event.host.firstName} away and fill this event! I included the message from ${event.host.firstName} below, and you can get details and sign up here: ${event.link}`,

`When someone working in this political revolution calls for some help, we try to answer. ${event.host.firstName} needs more people to help fill up an upcoming event on ${eventDate}. Can you join in? RSVP and get more info here: ${event.link}`,

`Do you have plans on ${eventDate}? There's a volunteer event for Bernie in ${event.venueCity} that needs more people to fill it, and the event host asked me to pass along the message below. You can get more details and sign up here: ${event.link}`,

`OK folks, a local volunteer for Bernie needs our help, so let's show up! ${event.host.firstName} in ${event.venueCity} has asked me to forward on the message below to supporters nearby. The short version is that there's an event coming up on ${eventDate} that needs more people to join in. You can RSVP and get more info here: ${event.link}`
];
    return this.getRandomSubarray(messageTemplates, 1)[0];
  }

  renderRecipientInfo() {
    let recipientsCount = this.state.recipientLimit || (this.props.event.nearbyPeople.length + 1)
    let recipientsSample = this.getRandomSubarray(this.props.event.nearbyPeople, 10)

    if (recipientsCount === 0) {
      return (
        <Paper zDepth={1} style={this.styles.recipientInfoContainer}>
          <p style={{color: 'red', fontWeight: 'strong'}}>
            Everyone who would have received this email has previously been contacted using this tool.
            <br />
            <br />
            We don't want to harass people, so this tool is disabled for this event for now.
          </p>
      </Paper>
      )
    } else {
      return (
        <Paper zDepth={1} style={this.styles.recipientInfoContainer}>
          <p>This email will be sent to <strong>{recipientsCount} people</strong>, including:</p>
          <br />
          <ul>
            {recipientsSample.map( (person, i) => {
              return <li key={`person${i}`}>
                {person.firstName || person.lastName} <tt>&lt;{person.email}&gt;</tt>
              </li>
            })}
          </ul>
        </Paper>
      )
    }
  }

  render() {
    let recipients = []

    if (!this.state.testMode) {
      this.props.event.nearbyPeople.map((person) => recipients.push(person.id))
      recipients.push(this.props.event.host.id)
    }

    let recipientLimit = this.state.recipientLimit || recipients.length

    let disableSubmit = (this.props.event.nearbyPeople.length === 0)

    return (
      <div style={this.styles.pageContainer}>
        <MutationHandler ref='mutationHandler'
                         successMessage='Event email sent!'
                         mutationClass={CreateAdminEventEmail} />
        <div style={BernieText.title}>
          Send Event Email
        </div>

        <Paper zDepth={2} style={this.styles.formContainer}>
          <GCForm
            schema={this.formSchema}
            defaultValue={{
              hostEmail: this.props.event.host.email,
              senderMessage: this.getSenderMessage(this.props.event)
            }}
            onSubmit={(formValues) => {
              this.refs.mutationHandler.send({
                listContainer: this.props.listContainer,
                adminEmail: this.props.currentUser.email,
                recipients: recipients.slice(0, recipientLimit),
                ...formValues
              })
            }}
          >
            <Form.Field
              name='hostEmail'
              label="Host Email Address"
            />
            <br />
            <Form.Field
              name='senderEmail'
              label="Sender Email Address"
            />
            <Form.Field
              name='hostMessage'
              multiLine={true}
              rows={5}
              label="Message From Host"
            />
            <br />
            <Form.Field
              name='senderMessage'
              multiLine={true}
              rows={5}
              label="Message From Sender"
            />
            <br />
            <br />
            <Form.Field
              name='toolPassword'
              label="Password for this tool (ask an admin)"
            />
            <br />
            <br />
            <h4 style={BernieText.default}>Number of recipients: {recipientLimit} (plus you)</h4>
            <Slider
              defaultValue={recipients.length}
              disabled={this.state.testMode}
              max={recipients.length}
              min={1}
              step={1}
              onChange={(_, newSliderValue) => {
                this.setState({recipientLimit: newSliderValue})
              }}
            />
            <br />
            <br />
            <Toggle
              label='Test mode (only delivers to you)'
              toggled={this.state.testMode}
              onToggle={() => {
                this.setState({testMode: !this.state.testMode})
              }}
            />
            <br />
            <br />
            <Form.Button type='submit' label='Send!' fullWidth={true} disabled={disableSubmit} />
          </GCForm>
        </Paper>

        {this.renderRecipientInfo()}

        <Paper zDepth={1} style={this.styles.detailsContainer}>
          <EventPreview event={this.props.event} />
        </Paper>
      </div>
    )
  }
}

export default Relay.createContainer(AdminEventEmailCreationForm, {
  fragments: {
    currentUser: () => Relay.QL`
      fragment on User {
        id
        email
      }
    `,
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        ${CreateAdminEventEmail.getFragment('listContainer')},
      }
    `,
    event: () => Relay.QL`
      fragment on Event {
        attendeesCount
        attendeeVolunteerMessage
        attendeeVolunteerShow
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
        link
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
