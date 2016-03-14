import React from 'react'
import Relay from 'react-relay'
import {BernieColors, BernieText} from './styles/bernie-css'
import {Paper, Styles} from 'material-ui'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import EventPreview from './EventPreview'
import yup from 'yup'
import moment from 'moment'
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider'
import {BernieTheme} from './styles/bernie-theme'
import stripScripts from '../helpers/stripScripts'

const momentWithTimezone = (startDate, timeZone) => {
  return moment(startDate).tz(timeZone)
}

class EventDataUpload extends React.Component {
  styles = {
    detailsContainer: {
      float: 'left',
      marginTop: '1rem',
      padding: 10,
      width: '50%'
    },

    formContainer: {
      float: 'right',
      marginTop: '1rem',
      padding: 10,
      width: '40%'
    },

    pageContainer: {
      margin: '1rem'
    }
  }

  render() {
    const event = this.props.event
    let formattedDateTime = momentWithTimezone(event.startDate, event.localTimezone)
    formattedDateTime = formattedDateTime ? formattedDateTime.format('LLLL') : event.startDate

    if (!event)
      return <div style={{ textAlign: 'center', margin: '4em'}}>
                <h1 style={BernieText.title}>Invalid Event</h1>
                <p style={BernieText.default}>This event does not exist. If you've just recently created your event.
                this error may resolve itself in a short period of time. It's also
                possible your event was deleted. Please email <a href="mailto:help@berniesanders.com">help@berniesanders.com</a> if you need help.</p>
              </div>

    return (
      <MuiThemeProvider muiTheme={Styles.getMuiTheme(BernieTheme)}>
        <div style={this.styles.pageContainer}>

          <div style={this.styles.detailsContainer}>
            <h1 style={BernieText.title}>{event.name}</h1>
            <h3 style={{...BernieText.secondaryTitle, fontSize: '1.2rem'}}>{formattedDateTime}</h3>
            <p dangerouslySetInnerHTML={stripScripts(event.description)}></p>
          </div>

          <div style={this.styles.formContainer}>
            <Paper style={{padding: 15}}>
              <h1>Upload Form</h1>
            </Paper>
          </div>

        </div>
      </MuiThemeProvider>
    )
  }
}

export default Relay.createContainer(EventDataUpload, {
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
