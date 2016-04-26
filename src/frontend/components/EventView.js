import React from 'react'
import Relay from 'react-relay'
import {BernieColors, BernieText} from './styles/bernie-css'
import {Paper, Slider, Toggle, Styles} from 'material-ui'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import EventPreview from './EventPreview'
import {GoogleMapLoader, GoogleMap, Marker} from 'react-google-maps'
import yup from 'yup'
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider'
import {BernieTheme} from './styles/bernie-theme';

const publicEventsRootUrl = 'https://secure.berniesanders.com/page/event/detail/'

class EventView extends React.Component {
  styles = {
    detailsContainer: {
      float: 'left',
      marginTop: '1rem',
      padding: 10,
      width: '60%'
    },

    mapContainer: {
      position: 'fixed',
      right: '2rem',
      width: '35%',
      height: 300,
      marginTop: '2rem',
      marginLeft: '2rem',
      border: 'solid 1px ' + BernieColors.lightGray
    },

    pageContainer: {
      margin: '1rem'
    }
  }

  state = {
    testMode: false,
    recipientLimit: null
  }

  generateMarker() {
    return {
      position: {
        lat: this.props.event.latitude,
        lng: this.props.event.longitude
      },
      key: 'event',
      title: this.props.event.venueAddr1,
      name: this.props.event.name
    }
  }

  render() {
    if (!this.props.event)
      return <div style={{ textAlign: 'center', margin: '4em'}}>
                <h1 style={BernieText.title}>Invalid Event</h1>
                <p style={BernieText.default}>This event does not exist. If you've just recently created your event.
                this error may resolve itself in a short period of time. It's also
                possible your event was deleted. Please email <a href="mailto:help@berniesanders.com">help@berniesanders.com</a> if you need help.</p>
              </div>

    let event_type_name = 'volunteer event'
    if(this.props.event.eventType.name.toLowerCase().indexOf('phone bank') > -1){
      event_type_name = 'phone bank party'
    }
    else if(this.props.event.eventType.name.toLowerCase().indexOf('barnstorm') > -1){
      event_type_name = 'Barnstorm event'
    }

    const marker = this.generateMarker()

    return (
      <MuiThemeProvider muiTheme={Styles.getMuiTheme(BernieTheme)}>
        <div style={this.styles.pageContainer}>

          <div style={this.styles.detailsContainer}>
            <p style={BernieText.secondaryTitle}>Event Details:</p>
            <EventPreview event={this.props.event} />
          </div>

          <div style={this.styles.mapContainer}>
            <GoogleMapLoader
              containerElement={
                <div
                  style={{
                    height: '100%',
                    width: '100%'
                  }}
                />
              }
              googleMapElement={
                <GoogleMap
                  ref='map'
                  options={{
                    scrollwheel: false
                  }}
                  defaultZoom={14}
                  defaultCenter={marker.position}>
                  <Marker
                    {...marker}
                  />
                </GoogleMap>
              }
            />
          </div>

        </div>
      </MuiThemeProvider>
    )
  }
}

export default Relay.createContainer(EventView, {
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
