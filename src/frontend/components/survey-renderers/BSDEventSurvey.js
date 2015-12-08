import React from 'react';
import Relay from 'react-relay'
import BSDSurvey from './BSDSurvey'
import {GoogleMapLoader, GoogleMap, Marker} from 'react-google-maps';

class BSDEventSurvey extends React.Component {
  static propTypes = {
    onSubmitted : React.PropTypes.func,
    initialValues: React.PropTypes.object,
    survey: React.PropTypes.object
  }

  submit() {
    this.refs.survey.refs.component.submit()
  }

  renderMap() {
    let center = {
      lat: this.props.interviewee.address.latitude,
      lng: this.props.interviewee.address.longitude
    }
    let events = [
      {
        ...center,
        key: 'center'
      }
    ];

    return (
      <div style={{height: '100%', width: '100%'}}>
      <GoogleMapLoader
        containerElement={
          <div
            style={{
              height: '100%',
            }}
          />
        }
        googleMapElement={
          <GoogleMap
            ref={(map) => console.log(map)}
            defaultZoom={10}
            defaultCenter={center}>
            {events.map((event, index) => {
              return (
                <Marker
                  {...event}
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
          name
          latitude
          longitude
        }
      }
    `
  }
})

