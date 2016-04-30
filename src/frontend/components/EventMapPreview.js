import React from 'react'
import {GoogleMapLoader, GoogleMap, Marker} from 'react-google-maps'

export default class EventMapPreview extends React.Component {
  static propTypes = {
    event: React.PropTypes.object.isRequired,
    style: React.PropTypes.object,
    initialZoom: React.PropTypes.number,
    mapOptions: React.PropTypes.object
  }

  static defaultProps = {
    style: {},
    initialZoom: 14,
    mapOptions: {}
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
    const marker = this.generateMarker()
    return (
      <GoogleMapLoader
        containerElement={
          <div
            style={{
              height: '100%',
              width: '100%',
              ...this.props.style
            }}
          />
        }
        googleMapElement={
          <GoogleMap
            ref='map'
            options={{
              scrollwheel: false,
              ...this.props.mapOptions
            }}
            defaultZoom={this.props.initialZoom}
            defaultCenter={marker.position}>
            <Marker
              {...marker}
            />
          </GoogleMap>
        }
      />
    )
  }
}
