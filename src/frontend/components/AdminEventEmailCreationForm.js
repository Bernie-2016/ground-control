import React from 'react'
import Relay from 'react-relay'
import {BernieColors, BernieText} from './styles/bernie-css'
import {Paper} from 'material-ui'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import EventPreview from './EventPreview'
import MutationHandler from './MutationHandler'
import CreateAdminEventEmail from '../mutations/CreateAdminEventEmail'
import yup from 'yup'

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

  render() {
    let nearbyPeopleCount = this.props.event.nearbyPeople.length
    let nearbyPeopleSample = this.getRandomSubarray(this.props.event.nearbyPeople, 10)
    let recipients = this.props.event.nearbyPeople.map((person) => person.id)

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
              hostEmail: this.props.event.host.email
            }}
            onSubmit={(formValues) => {
              this.refs.mutationHandler.send({
                listContainer: this.props.listContainer,
                recipients: recipients,
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
            <Form.Button type='submit' label='Send!' fullWidth={true} />
          </GCForm>
        </Paper>

        <Paper zDepth={1} style={this.styles.recipientInfoContainer}>
          <p>This email will be sent to <strong>{nearbyPeopleCount} people</strong>, including:</p>
          <br />
          <ul>
            {nearbyPeopleSample.map( (person, i) => {
              return <li key={`person${i}`}>
                {person.firstName || person.lastName} <tt>&lt;{person.email}&gt;</tt>
              </li>
            })}
          </ul>
        </Paper>

        <Paper zDepth={1} style={this.styles.detailsContainer}>
          <EventPreview event={this.props.event} />
        </Paper>
      </div>
    )
  }
}

export default Relay.createContainer(AdminEventEmailCreationForm, {
  fragments: {
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
