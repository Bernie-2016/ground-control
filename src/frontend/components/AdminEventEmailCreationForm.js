import React from 'react'
import Relay from 'react-relay'
import {BernieColors, BernieText} from './styles/bernie-css'
import {Paper, Slider, Toggle} from 'material-ui'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import EventPreview from './EventPreview'
import moment from 'moment';
import MutationHandler from './MutationHandler'
import CreateAdminEventEmail from '../mutations/CreateAdminEventEmail'
import yup from 'yup'

const publicEventsRootUrl = 'https://secure.berniesanders.com/page/event/detail/'

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

  state = {
    testMode: false,
    recipientLimit: Math.min(this.props.event.nearbyPeople.length, 250),
    submitted: false,
    disableSubmit: false
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

    this.state.disableSubmit = (this.props.event.nearbyPeople.length === 0 || this.state.submitted)

    let adminAlias = this.props.currentUser.email.split('@')[0]
    let adminName = adminAlias.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})
    let adminAliases = {'jonwarnow': 'Jon', 'willeaston': 'Will', 'jonculver': 'Jon'}
    if (adminAliases.hasOwnProperty(adminAlias.toLowerCase())){
      adminName = adminAliases[adminAlias.toLowerCase()];
    }

    let eventTypeName = 'volunteer event';

    if(this.props.event.eventType.name.toLowerCase().indexOf('phone bank') > -1){
      eventTypeName = 'phone bank party'
    }

    if(this.props.event.eventType.name.toLowerCase().indexOf('barnstorm') > -1){
      eventTypeName = 'Barnstorm event'
    }

    let defaultSenderMessage = "Hey everyone, it's " + adminName + " from Bernie 2016 national staff.\n\n" +
        this.props.event.host.firstName + ", a local volunteer in " + this.props.event.venueCity + ", has asked me " +
        "to help find some nearby Bernie supporters to attend an event " +
        "on " + moment(this.props.event.startDate).format("dddd, MMMM Do") + ".\n\n" +
        "See their email below or just get more info and RSVP at this link:\n\n" +
        publicEventsRootUrl + this.props.event.eventIdObfuscated + "\n\n" +
        "Thanks,\n\n" +
        "Team Bernie"

    const baseString = yup.string();

    let modelSchema = yup.object({
      hostEmail: baseString.default(this.props.event.host.email).email().default(this.props.event.host.email).required(),
      senderEmail: baseString.default("info@berniesanders.com").email().required(),
      hostMessage: baseString.default(this.props.event.fastFwdRequest ? this.props.event.fastFwdRequest.hostMessage : '').required(),
      senderMessage: baseString.default(defaultSenderMessage).required(),
      toolPassword: baseString.required(),
      hostEmailSubject: baseString.default('HELP! I need more people to come to my ' + eventTypeName).required()
    });

    return (
      <div style={this.styles.pageContainer}>
        <MutationHandler ref='mutationHandler'
                         successMessage='Event email sent!'
                         mutationClass={CreateAdminEventEmail}
                         mutationName='createAdminEventEmail'
                         onSuccess={() => {
                            if(!this.state.testMode){
                              this.props.history.push('/admin/events#query[numEvents]=100&query[sortField]=startDate&query[sortDirection]=ASC&query[status]=FAST_FWD_REQUEST')
                            }
                         }} />
        <div style={BernieText.title}>
          Send Event Email
        </div>

        <Paper zDepth={2} style={this.styles.formContainer}>
          <GCForm
            schema={modelSchema}
            defaultValue = {modelSchema.default()}
            value = {this.state.model}
            onChange={ model => {
              this.setState({ model })
            }}
            onSubmit={(formValues) => {
              this.refs.mutationHandler.send({
                listContainer: this.props.listContainer,
                adminEmail: this.props.currentUser.email,
                recipients: recipients.slice(0, recipientLimit),
                eventId: this.props.event.id,
                ...formValues
              })
              this.setState({submitted: !this.state.testMode})
            }}
          >
            <Form.Field
              name='senderEmail'
              label="Sender Email Address"
            />
            <Form.Field
              name='senderMessage'
              multiLine={true}
              rows={5}
              label="Message From Sender"
            />
            <br />
            <Form.Field
              name='hostEmailSubject'
              multiLine={true}
              rows={2}
              label='Host Email Subject'
            />
            <br />
            <Form.Field
              name='hostEmail'
              label="Host Email Address"
            />
            <br />
            <Form.Field
              name='hostMessage'
              multiLine={true}
              rows={5}
              label="Message From Host"
            />
            <br />
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
              defaultValue={this.state.recipientLimit}
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
            <Form.Button type='submit' label='Send!' fullWidth={true} disabled={this.state.disableSubmit} />
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
