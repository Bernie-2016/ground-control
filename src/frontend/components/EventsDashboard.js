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

  styles = () => {
    return {
      sideBar: {
        width: '20%',
        border: 'none',
        zIndex: 10
      },
      container: {
        borderBottom: 'none',
        border: 'none'
      },
      content: {
        height: this.state.windowHeight - 56,
        width: '80%',
        padding: 5, top: 56,
        position: 'absolute',
        overflow: 'scroll',
        boxSizing: 'border-box'
      }
    }
  }

  renderEvents() {
    const events = this.props.currentUser.relatedPerson ? this.props.currentUser.relatedPerson.hostedEvents : []
    if (events.length === 0)
      return <div style={{textAlign: 'center', margin: '4em'}}>
                <h1 style={BernieText.title}>No Events</h1>
                <p style={BernieText.default}>You haven't signed up to host any events yet! <a href="/events/create">Click here</a> to create your first event.</p>
              </div>
    return events.map((event) => {
      const utcOffset = event.localUTCOffset || 0
      const timezone = event.localTimezone || 'UTC'
      const offsetDate = moment(event.startDate).utcOffset(utcOffset)
      const formattedDate = offsetDate.format('l LT')
      return (
        <div key={event.id} style={{padding: 5, width: '100%', boxSizing: 'border-box'}}>
          <Card>
            <CardTitle
              title={<span style={{...BernieText.title, fontSize: '1.2em'}}>{event.name}</span>}
              subtitle={<span style={{...BernieText.secondaryTitle, fontSize: '1.1em', letterSpacing: '1px'}}>{formattedDate}</span>}
              actAsExpander={true}
              showExpandableButton={true}
            />
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
                label="Send Turnout Email"
                onTouchTap={() => this.props.history.push(`/events/${event.eventIdObfuscated}/request-email`)}
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
            </CardActions>
          </Card>
        </div>
      )
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
        <List style={{marginTop: 56}}>
          <Subheader>General</Subheader>
          <ListItem
            primaryText="Hosting"
            secondaryText="Events you are hosting"
          />
          <ListItem
            primaryText="Attending"
            secondaryText="Events you are attending"
          />
        </List>
        <Divider />
        <List>
          <Subheader>View Settings</Subheader>
          <ListItem
            leftCheckbox={<Checkbox />}
            primaryText="Show All Events"
            secondaryText="View all past and upcoming events"
          />
          <ListItem
            leftCheckbox={<Checkbox />}
            primaryText="Use Calendar View"
            secondaryText="View as a calendar instead of list"
          />
        </List>
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
          }
        }
      }
    `
  }
})