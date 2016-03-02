import React from 'react'
import Relay from 'react-relay'
import {BernieColors, BernieText} from './styles/bernie-css'
import {Paper, Slider, Toggle} from 'material-ui'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import EventPreview from './EventPreview'
import RSVPEventForm from './RSVPEventForm'
import MutationHandler from './MutationHandler'
import yup from 'yup'

class RSVPEventPage extends React.Component {
  render() {
    return (
      <div
        style={{
          margin: '30px'
        }}
      >
        <Paper
          style={{
            width: '70%',
            float: 'left'
          }}
        >
          <EventPreview event={this.props.event} />
        </Paper>
        <div
          style={{
            width: '30%',
            float: 'right'
          }}
        >
          <RSVPEventForm />
        </div>
      </div>
    )
  }
}

export default Relay.createContainer(RSVPEventPage, {
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
