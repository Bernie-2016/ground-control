import React from 'react';
import Relay from 'react-relay'
import BSDSurvey from './BSDSurvey'
import {BernieColors, BernieText} from '../styles/bernie-css'
import {GoogleMapLoader, GoogleMap, Marker} from 'react-google-maps';
import {FlatButton, Paper} from 'material-ui';
import moment from 'moment';

class BSDEventSurvey extends React.Component {
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
    if (!marker)
      return <div></div>;
    if (marker.key === 'home')
      return <div></div>
    let button = <div></div>;
    if (marker.key !== 'home')
      button = (
        <FlatButton label='Select' style={{
          ...BernieText.inputLabel,
          backgroundColor: BernieColors.red,
          marginTop: 10,
        }}
          onTouchTap={(event) => {
            this.refs.survey.refs.component.setFieldValue('event_id', marker.eventId)
          }}
        />
      )
    return (
      <Paper zDepth={0} style={{
        marginTop: 10,
        padding: '10px 10px 10px 10px',
        border: 'solid 1px ' + BernieColors.lightGray
      }}>
        <div style={{
          ...BernieText.secondaryTitle,
          color: BernieColors.gray,
          fontSize: '1.0em'
        }}>
          {moment(marker.startDate).format('h:mm A  MMM D')}
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
          {button}
        </div>
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
    let markers = [
      {
        position: center,
        key: 'home',
        title: 'home',
        name: 'Interviewee home'
      }
    ];

    this.props.interviewee.nearbyEvents.forEach((event) => {
      markers.push({
        position: {
          lat: event.latitude,
          lng: event.longitude
        },
        key: event.id,
        title: event.name,
        name: event.name,
        startDate: event.startDate,
        venueName: event.venueName,
        addr1: event.addr1,
        addr2: this.getEventAddr2(event),
        eventId: event.eventIdObfuscated
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

export default Relay.createContainer(BSDEventSurvey, {
  fragments: {
    survey: () => Relay.QL`
      fragment on Survey {
        ${BSDSurvey.getFragment('survey')}
      }
    `,
    interviewee: () => Relay.QL`
      fragment on Person {
        ${BSDSurvey.getFragment('interviewee')}
        email
        address {
          latitude
          longitude
        }
        nearbyEvents(within:20) {
          id
          eventIdObfuscated
          name
          startDate
          venueName
          venueAddr1
          venueAddr2
          venueCity
          venueState
          description
          latitude
          longitude
        }
      }
    `
  }
})

