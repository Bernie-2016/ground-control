import React from 'react'
import Relay from 'react-relay'
import {
  LeftNav,
  Styles,
  Divider,
  FloatingActionButton,
  RaisedButton,
  FlatButton,
  Card,
  CardTitle,
  CardText,
  CardActions,
  FontIcon,
  List,
  ListItem,
  Checkbox
} from 'material-ui'
import Subheader from 'material-ui/lib/Subheader'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import yup from 'yup'
import moment from 'moment'
import {BernieTheme} from './styles/bernie-theme'
import {BernieText, BernieColors} from './styles/bernie-css'
import stripScripts from '../helpers/stripScripts'
import SideBarLayout from './SideBarLayout'
import humps from 'humps'
import Papa from 'papaparse'
import downloadCSV from '../helpers/downloadCSV'
import flattenJSON from '../helpers/flattenJSON'

const publicEventsRootUrl = 'https://secure.berniesanders.com/page/event'
const topNavHeight = 56

class LinkButton extends React.Component {
  static propTypes = {
    label: React.PropTypes.string.isRequired,
    href: React.PropTypes.string.isRequired
  }

  render() {
    return (
      <FlatButton
        label={this.props.label}
        linkButton={true}
        href={this.props.href}
        target='_blank'
        style={{textAlign: 'center'}}
      />
    )
  }
}

class EventsDashboard extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      displayPastEvents: true
    }

    window.addEventListener('resize', this._handleResize)
  }

  _handleResize = (e) => {
    this.setState({
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    })
  }

  styles = () => {
    return {
      sideBar: {
        width: this.state.windowWidth * 0.2,
        border: 'none',
        zIndex: 10
      },
      container: {
        borderBottom: 'none',
        border: 'none'
      },
      content: {
        height: this.state.windowHeight - topNavHeight,
        width: this.state.windowWidth * 0.8,
        padding: 5, top: topNavHeight,
        position: 'absolute',
        overflow: 'scroll',
        boxSizing: 'border-box'
      }
    }
  }

  renderEvents() {
    const events = this.props.currentUser.relatedPerson ? this.props.currentUser.relatedPerson.hostedEvents : []
    if (events.length === 0)
      return <div style={{textAlign: 'center', margin: '4em', fontSize: '1.3em'}}>
                <h1 style={BernieText.title}>No Events</h1>
                <p style={BernieText.default}>You haven't signed up to host any events yet!</p>
                <p><a href="/events/create">Click here</a> to create your first event.</p>
                <br />
                <p style={{fontSize: '0.7em'}}>If you created an event recently, it may take up to 2 hours for it to be synced into Ground Control.</p>
              </div>

    const currentTime = new moment()
    return events.map((event) => {
      const utcOffset = event.localUTCOffset || 0
      const timezone = event.localTimezone || 'UTC'
      const offsetDate = moment(event.startDate).utcOffset(utcOffset)
      const formattedDate = offsetDate.format('l LT')

      // Return empty div if event is in past
      if (!this.state.displayPastEvents && !offsetDate.isAfter(currentTime))
        return <div></div>
      else {
        return (
          <div key={event.id} style={{padding: 5, width: '100%', boxSizing: 'border-box'}}>
            <Card>
              <CardTitle
                actAsExpander={true}
                showExpandableButton={true}
              >
                <span style={{...BernieText.title, fontSize: '1.4em'}}>{event.name}</span>
                <br />
                <span style={{...BernieText.secondaryTitle, fontSize: '0.9em', letterSpacing: '1px'}}>{formattedDate}</span>
              </CardTitle>
              <CardText expandable={true}>
                <div dangerouslySetInnerHTML={stripScripts(event.description)}></div>
              </CardText>
              <CardActions expandable={true}>
                <LinkButton
                  label='View'
                  href={`${publicEventsRootUrl}/detail/${event.eventIdObfuscated}`}
                />
                <LinkButton
                  label='Edit'
                  href={`${publicEventsRootUrl}/edit_details?event_id=${event.eventIdUnObfuscated}`}
                />
                <LinkButton
                  label='Delete'
                  href={`${publicEventsRootUrl}/delete/${event.eventIdObfuscated}`}
                />
                <FlatButton
                  label="Download RSVPs"
                  disabled={(event.attendees.length === 0)}
                  onTouchTap={() => {
                    const attendees = event.attendees.map((attendee) => flattenJSON(attendee, {ignoreProps: ['__dataID__']}))
                    const data = Papa.unparse(humps.decamelizeKeys(attendees))
                    downloadCSV(data, `${event.eventIdObfuscated}.rsvps.csv`)
                  }}
                />
                <FlatButton
                  label="Send Turnout Email"
                  onTouchTap={() => this.props.history.push(`/events/${event.eventIdObfuscated}/request-email`)}
                />
                <FlatButton
                  label="Open Call Assignment"
                  disabled={(event.relatedCallAssignment === null)}
                  onTouchTap={() => this.props.history.push(`/call/${event.relatedCallAssignment.id}`)}
                />
              </CardActions>
            </Card>
          </div>
        )
      }
    })
  }

  renderContent() {
    return (
      <div style={this.styles().content}>
        {this.renderEvents()}
        <FloatingActionButton style={{marginRight: 20, position: 'fixed', bottom: 20, right: 10}} linkButton={true} href='/events/create' >
          <FontIcon className="material-icons">add</FontIcon>
        </FloatingActionButton>
      </div>
    )
  }

  render() {
    const sideBar = (
      <LeftNav
        docked={true}
        open={true}
        width={this.styles().sideBar.width}
      >
        <List style={{marginTop: topNavHeight}}>
          <Subheader>View Settings</Subheader>
          <ListItem
            leftCheckbox={
              <Checkbox
                checked={this.state.displayPastEvents}
                onCheck={(_, displayPastEvents) => this.setState({displayPastEvents})}
              />
            }
            primaryText="Show All Events"
            secondaryText="View all past and upcoming events"
          />
        </List>
        <Divider />
      </LeftNav>
    )

    return (
      <SideBarLayout
        sideBar={sideBar}
        sideBarStyle={this.styles().sideBar}
        content={this.renderContent()}
        contentViewStyle={this.styles().container}
      />
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
            eventIdUnObfuscated
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
            relatedCallAssignment {
              id
            }
          }
        }
      }
    `
  }
})