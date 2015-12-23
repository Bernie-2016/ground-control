import React from 'react';
import Relay from 'react-relay'
import BSDSurvey from './BSDSurvey'
import {BernieColors, BernieText} from '../styles/bernie-css'
import {GoogleMapLoader, GoogleMap, Marker} from 'react-google-maps';
import {FlatButton, Paper} from 'material-ui';
import moment from 'moment';
import FontIcon from 'material-ui/lib/font-icon';

class BSDPhonebankRSVPSurvey extends React.Component {
  static propTypes = {
    onSubmitted : React.PropTypes.func,
    initialValues: React.PropTypes.object,
    survey: React.PropTypes.object
  }

  submit() {
    this.refs.survey.refs.component.submit()
  }

  state = {
    clickedMarker: null
  }

  handleMarkerClick(marker) {
    this.setState({clickedMarker: marker})
  }

  renderMarkerDescription(marker) {
    let description = <div></div>
    if (!marker)
      return <div></div>;
    if (marker.key === 'home')
      description = (
        <div>
          <div style={{
            ...BernieText.default,
            fontWeight: 600,
            fontSize: '1.0em'
          }}>
            {`${this.props.interviewee.firstName}'s home`}
          </div>
        </div>
      )
    let button = <div></div>;
    if (marker.key !== 'home')
      description = (
        <div>
          <div style={{
            ...BernieText.secondaryTitle,
            color: BernieColors.gray,
            fontSize: '1.0em'
          }}>
            {moment(marker.startDate).utcOffset(marker.localUTCOffset).format('h:mm A  - dddd, MMM D')}
          </div>
          <div style={{
            ...BernieText.default,
            fontWeight: 600,
            fontSize: '1.0em'
          }}>
            {marker.name}
          </div>
          <div style={{
            ...BernieText.default,
            fontSize: '1.0em'
          }}>
            <div>{marker.venueName}</div>
            <div>{marker.addr1}</div>
            <div>{marker.addr2}</div>
            <div>Capacity: {marker.capacity}</div>
            <div>Attendees: {marker.attendeesCount}</div>
            <FlatButton label='Select' style={{
              ...BernieText.inputLabel,
              backgroundColor: BernieColors.red,
              marginTop: 10,
            }}
              onTouchTap={(event) => {
                this.refs.survey.refs.component.setFieldValue('event_id', marker.eventId)
              }}
            />
          </div>
        </div>
      )

    return (
      <Paper zDepth={0} style={{
        marginTop: 10,
        padding: '10px 10px 10px 10px',
        border: 'solid 1px ' + BernieColors.lightGray
      }}>
        {description}
      </Paper>
    )
  }

  getEventAddr2(event) {
    let desc = ''
    if (event.venueAddr2)
      desc = desc + ' ' + event.venueAddr2;
    if (event.venueCity)
      desc = desc + ' ' + event.venueCity;
    if (event.venueState)
      desc = desc + ', ' + event.venueState
    return desc.trim();
  }

  renderMap() {
    let center = {
      lat: this.props.interviewee.address.latitude,
      lng: this.props.interviewee.address.longitude
    }
    let homeIcon = {
      path: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
      fillColor: BernieColors.blue,
      fillOpacity: 1.0,
      scale: 1,
      strokeColor: BernieColors.blue,
      strokeWeight: 2
    };
    let markers = [
      {
        position: center,
        key: 'home',
        title: 'home',
        name: 'Interviewee home',
        icon: homeIcon
      }
    ];

    this.props.interviewee.nearbyEvents.forEach((event) => {
      markers.push({
        position: {
          lat: event.latitude,
          lng: event.longitude
        },
        localUTCOffset: event.localUTCOffset,
        key: event.id,
        title: event.name,
        name: event.name,
        startDate: event.startDate,
        venueName: event.venueName,
        addr1: event.venueAddr1,
        addr2: this.getEventAddr2(event),
        eventId: event.eventIdObfuscated,
        capacity: event.capacity,
        attendeesCount: event.attendeesCount
      })
    })
    return (
      <div style={{height: '100%', width: '100%'}}>
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
            defaultZoom={9}
            defaultCenter={center}>
            {markers.map((marker, index) => {
              return (
                <Marker
                  {...marker}
                  onClick={this.handleMarkerClick.bind(this, marker)}
                />
              );
            })}
          </GoogleMap>
        }
      />
      </div>
    )
  }

  render() {
    return (
      <div>
        <div style={{width: '100%', height: 200}}>
          {this.renderMap()}
        </div>
        {this.renderMarkerDescription(this.state.clickedMarker)}
        <BSDSurvey
          ref='survey'
          survey={this.props.survey}
          interviewee={this.props.interviewee}
          onSubmitted={this.props.onSubmitted}
        />
      </div>
    )
  }
}

export default Relay.createContainer(BSDPhonebankRSVPSurvey, {
  initialVariables: {
    type: 'phonebank'
  },
  fragments: {
    survey: () => Relay.QL`
      fragment on Survey {
        ${BSDSurvey.getFragment('survey')}
      }
    `,
    interviewee: () => Relay.QL`
      fragment on Person {
        ${BSDSurvey.getFragment('interviewee')}
        firstName
        email
        address {
          latitude
          longitude
        }
        nearbyEvents(within:20, type:$type) {
          id
          eventIdObfuscated
          name
          startDate
          localTimezone
          localUTCOffset
          venueName
          venueAddr1
          venueAddr2
          venueCity
          venueState
          description
          latitude
          longitude
          capacity
          attendeesCount
        }
      }
    `
  }
})

