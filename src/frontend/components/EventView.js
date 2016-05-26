import React from 'react'
import Relay from 'react-relay'
import {BernieText} from './styles/bernie-css'
import {Paper, Styles} from 'material-ui'
import EventPreview from './EventPreview'
import EventInvalid from './EventInvalid'
import yup from 'yup'
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider'
import {BernieTheme} from './styles/bernie-theme'

const publicEventsRootUrl = 'https://secure.berniesanders.com/page/event/detail/'

class EventView extends React.Component {
  styles = {
    pageContainer: {
      margin: '0 auto',
      padding: '1rem',
      maxWidth: 1100
    }
  }

  render() {
    if (!this.props.event)
      return <EventInvalid />

    let event_type_name = 'volunteer event'
    if(this.props.event.eventType.name.toLowerCase().indexOf('phone bank') > -1){
      event_type_name = 'phone bank party'
    }
    else if(this.props.event.eventType.name.toLowerCase().indexOf('barnstorm') > -1){
      event_type_name = 'Barnstorm event'
    }

    return (
      <MuiThemeProvider muiTheme={Styles.getMuiTheme(BernieTheme)}>
        <div style={this.styles.pageContainer}>
          <p style={BernieText.secondaryTitle}>Event Details:</p>
          <EventPreview event={this.props.event} />
        </div>
      </MuiThemeProvider>
    )
  }
}

export default Relay.createContainer(EventView, {
  fragments: {
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
        }
        hostReceiveRsvpEmails
        id
        isSearchable
        latitude
        localTimezone
        localUTCOffset
        longitude
        name
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
