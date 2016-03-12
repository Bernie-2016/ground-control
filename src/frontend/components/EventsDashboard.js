import React from 'react'
import Relay from 'react-relay'
import {Styles, Divider, RaisedButton, Card, CardHeader, CardText, FontIcon} from 'material-ui'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import yup from 'yup'
import {BernieTheme} from './styles/bernie-theme'
import {BernieText, BernieColors} from './styles/bernie-css'
import {states} from './data/states'

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

  render() {

    return (
      <div style={{height: this.state.windowHeight - 56, top: 56, position: 'absolute', overflow: 'scroll'}}>
        hello
      </div>
    )
  }
}

export default Relay.createContainer(EventsDashboard, {
  initialVariables: {
    numEvents: 100,
    sortField: 'startDate',
    sortDirection: 'ASC',
    status: 'PENDING_REVIEW',
    filters: {},
    hostFilters: {}
  },
  fragments: {
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        eventTypes {
          id
          name
        }
        events(
          first: $numEvents
          eventFilterOptions: $filters
          hostFilterOptions: $hostFilters
          status: $status
          sortField: $sortField
          sortDirection: $sortDirection
        ) {
          edges {
            cursor
            node {
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
      }
    `
  }
})