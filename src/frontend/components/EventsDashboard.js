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
  Checkbox,
  Dialog
} from 'material-ui'
import Subheader from 'material-ui/lib/Subheader'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import yup from 'yup'
import moment from 'moment'
import {BernieText, BernieColors, NAVBAR_HEIGHT} from './styles/bernie-css'
import stripScripts from '../helpers/stripScripts'
import SideBarLayout from './SideBarLayout'
import EventRSVPTable from './EventRSVPTable'
import EventOfficialStamp from './EventOfficialStamp'
import humps from 'humps'
import Papa from 'papaparse'
import downloadCSV from '../helpers/downloadCSV'
import flattenJSON from '../helpers/flattenJSON'

const publicEventsRootUrl = 'https://secure.berniesanders.com/page/event'

class ActionButton extends React.Component {
  static propTypes = {
    label: React.PropTypes.string.isRequired,
    title: React.PropTypes.string,
    iconType: React.PropTypes.string
  }

  render() {
    return (
      <FlatButton
        {...this.props}
        style={{...this.props.style, textAlign: 'center'}}
        icon={<FontIcon className="material-icons">{this.props.iconType}</FontIcon>}
      />
    )
  }
}

class LinkButton extends ActionButton {
  static propTypes = {
    href: React.PropTypes.string.isRequired
  }

  render() {
    return (
      <ActionButton
        {...this.props}
        linkButton={true}
        target='_blank'
      />
    )
  }
}

class RSVPModalView extends React.Component {
  static propTypes = {
    open: React.PropTypes.bool,
    onRequestClose: React.PropTypes.func,
    event: React.PropTypes.object
  }

  actions = [
    <FlatButton
      label="Close"
      secondary={true}
      onTouchTap={this.props.onRequestClose}
    />,
    <ActionButton
      label="Download as CSV"
      primary={true}
      iconType='file_download'
      onTouchTap={() => {
        const attendees = this.props.event.attendees.map((attendee) => flattenJSON(attendee, {ignoreProps: ['__dataID__']}))
        const data = Papa.unparse(humps.decamelizeKeys(attendees))
        downloadCSV(data, `${this.props.event.eventIdObfuscated}.rsvps.csv`)
      }}
    />,
  ]

  render() {
    const event = this.props.event || {}
    return (
      <Dialog
        title={`RSVPs for ${event.name}`}
        actions={this.actions}
        autoScrollBodyContent={true}
        {...this.props}
      >
        <EventRSVPTable attendees={event.attendees} />
      </Dialog>
    )
  }
}

class EventsDashboard extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      displayPastEvents: true,
      showRSVPModal: false,
      activeEvent: null
    }

    window.addEventListener('resize', this._handleResize)
  }

  _handleResize = (e) => {
    this.setState({
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    })
  }

  isDesktopWidth = () => (this.state.windowWidth > 1024)

  styles = () => {
    return {
      sideBar: {
        width: this.isDesktopWidth() ? this.state.windowWidth * 0.2 : 0,
        border: 'none',
        zIndex: 10
      },
      container: {
        borderBottom: 'none',
        border: 'none'
      },
      content: {
        height: this.state.windowHeight - NAVBAR_HEIGHT,
        width: this.isDesktopWidth() ? this.state.windowWidth * 0.8 : '100%',
        padding: 5, top: NAVBAR_HEIGHT,
        position: 'absolute',
        overflow: 'scroll',
        boxSizing: 'border-box',
        backgroundColor: 'rgb(245,245,245)'
      }
    }
  }

  renderEvents() {
    const events = this.props.currentUser.relatedPerson ? this.props.currentUser.relatedPerson.hostedEvents : []
    if (events.length === 0)
      return <div style={{textAlign: 'center', margin: '2em', fontSize: '1.3em'}}>
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
      const eventIsInFuture = offsetDate.isAfter(currentTime)
      const eventTextStyle = eventIsInFuture ? {} : {color: BernieColors.gray}

      // Return empty div if event is in past
      if (!this.state.displayPastEvents && !eventIsInFuture)
        return <div key={event.id}></div>
      else {
        return (
          <div key={event.id} style={{padding: 5, width: '100%', boxSizing: 'border-box'}}>
            <Card>
              <CardTitle
                actAsExpander={true}
                showExpandableButton={true}
              >
                <span style={{...BernieText.title, fontSize: '1.4em', ...eventTextStyle}}>{event.name}</span>
                {event.isOfficial
                  ? <EventOfficialStamp
                    style={{
                      marginLeft: '1em',
                      verticalAlign: 'bottom',
                    }}
                    color={eventTextStyle.color}
                  >
                    Official
                  </EventOfficialStamp>
                  : null
                }
                <br />
                <span style={{...BernieText.secondaryTitle, fontSize: '0.9em', letterSpacing: '1px', ...eventTextStyle}}>{formattedDate}</span>
              </CardTitle>
              <CardText expandable={true}>
                <div dangerouslySetInnerHTML={stripScripts(event.description)}></div>
              </CardText>
              <CardActions expandable={true}>
                <LinkButton
                  label='Open'
                  iconType='open_in_new'
                  href={`${publicEventsRootUrl}/detail/${event.eventIdObfuscated}`}
                />
                <LinkButton
                  label='Edit'
                  iconType='mode_edit'
                  href={`${publicEventsRootUrl}/edit_details?event_id=${event.eventIdUnObfuscated}`}
                />
                <LinkButton
                  label='Delete'
                  iconType='delete'
                  href={`${publicEventsRootUrl}/delete/${event.eventIdObfuscated}`}
                />
                <ActionButton
                  label="View RSVPs"
                  title="View details about event attendees"
                  iconType="list"
                  disabled={(event.attendees.length === 0)}
                  onTouchTap={() => {
                    this.setState({
                      activeEvent: event,
                      showRSVPModal: true
                    })
                  }}
                />
                <ActionButton
                  label="Invite by Email"
                  title="Invite nearby supporters to attend your event by email"
                  iconType="email"
                  onTouchTap={() => this.props.history.push(`/events/${event.eventIdObfuscated}/request-email`)}
                  disabled={!eventIsInFuture}
                />
                <ActionButton
                  label="Invite by Phone"
                  title="Invite nearby supporters to attend your event by phone"
                  iconType="phone"
                  disabled={eventIsInFuture ? (event.relatedCallAssignment === null) : true}
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
        <RSVPModalView
          event={this.state.activeEvent}
          open={this.state.showRSVPModal}
          onRequestClose={() => {
            this.setState({showRSVPModal: false})
          }}
          contentStyle={{width: '90%', maxWidth: 1100}}
        />
      </div>
    )
  }

  render() {
    const sideBar = (
      <LeftNav
        docked={true}
        open={this.isDesktopWidth()}
        width={this.styles().sideBar.width}
      >
        <List style={{marginTop: NAVBAR_HEIGHT}}>
          <Subheader>View Settings</Subheader>
          <ListItem
            leftCheckbox={
              <Checkbox
                checked={this.state.displayPastEvents}
                onCheck={(_, displayPastEvents) => this.setState({displayPastEvents})}
              />
            }
            primaryText="Show All Events"
            secondaryText={this.state.displayPastEvents ? "Including past events" : "Hiding past events"}
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
        containerStyle={this.styles().container}
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