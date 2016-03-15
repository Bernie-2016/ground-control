import React from 'react'
import Relay from 'react-relay'
import {Styles, Divider, FloatingActionButton, RaisedButton, FlatButton, Card, CardTitle, CardText, CardActions, FontIcon} from 'material-ui'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import yup from 'yup'
import moment from 'moment'
import {BernieTheme} from './styles/bernie-theme'
import {BernieText, BernieColors} from './styles/bernie-css'
import stripScripts from '../helpers/stripScripts'

const style = {
  marginLeft: 20,
}

class EventsDashboard extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    }

    window.addEventListener('resize', this._handleResize)
  }

  _handleResize = (e) => {
    this.setState({
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    })
  }

  renderEvents() {
    const events = this.props.currentUser.relatedPerson ? this.props.currentUser.relatedPerson.hostedEvents : []
    if (events.length === 0)
      return <div style={{ textAlign: 'center', margin: '4em'}}>
                <h1 style={BernieText.title}>No Events</h1>
                <p style={BernieText.default}>You haven't signed up to host any events yet! <a href="/events/create">Click here</a> to create your first event.</p>
              </div>
    return events.map((event) => {
      const utcOffset = event.localUTCOffset || 0
      const timezone = event.localTimezone || 'UTC'
      const offsetDate = moment(event.startDate).utcOffset(utcOffset)
      const formattedDate = offsetDate.format('l LT')
      return (
        <Card key={event.id} style={{width: '100%'}}>
          <CardTitle
            title={event.name}
            subtitle={formattedDate}
            actAsExpander={true}
            showExpandableButton={true}
          />
          <CardText expandable={true}>
            <div dangerouslySetInnerHTML={stripScripts(event.description)}></div>
          </CardText>
          <CardActions expandable={true}>
            <FlatButton
              label='View'
              onTouchTap={() => this.props.history.push('/events/' + event.eventIdObfuscated)}
            />
            <FlatButton label="Edit"/>
            <FlatButton label="Delete"/>
            <FlatButton
              label="Upload Sign In Sheets"
              onTouchTap={() => this.props.history.push('/events/' + event.eventIdObfuscated + '/upload')}
            />
          </CardActions>
        </Card>
      )
    })
  }

  render() {
    return (
      <div style={{height: this.state.windowHeight - 56, width: '100%', top: 56, position: 'absolute', overflow: 'scroll'}}>
        {this.renderEvents()}
        <FloatingActionButton style={{marginRight: 20, position: 'absolute', bottom: 20, right: 10}} linkButton={true} href='/events/create' >
          <FontIcon className="material-icons">add</FontIcon>
        </FloatingActionButton>
      </div>
    )
  }
}

export default Relay.createContainer(EventsDashboard, {
  fragments: {
    currentUser: () => Relay.QL`
      fragment on User {
        id
        email
        relatedPerson {
          hostedEvents {
            name
            id
            host {
              id
              firstName
              lastName
              email
            }
            eventType {
              id
              name
            }
            eventIdObfuscated
            flagApproval
            isOfficial
            description
            venueName
            latitude
            longitude
            venueZip
            venueCity
            venueState
            venueAddr1
            venueAddr2
            venueCountry
            venueDirections
            createDate
            startDate
            localTimezone
            localUTCOffset
            duration
            capacity
            attendeeVolunteerShow
            attendeeVolunteerMessage
            isSearchable
            publicPhone
            contactPhone
            hostReceiveRsvpEmails
            rsvpUseReminderEmail
            rsvpEmailReminderHours
            attendeesCount
            attendees {
              firstName
              lastName
              phone
              email
              address {
                city
                state
                zip
              }
            }
          }
        }
      }
    `
  }
})