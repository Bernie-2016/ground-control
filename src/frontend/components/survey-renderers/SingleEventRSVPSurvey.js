import React from 'react';
import Relay from 'react-relay';
import {BernieText} from '../styles/bernie-css';

class SingleEventRSVPSurvey extends React.Component {
  static propTypes = {
    onSubmitted: React.PropTypes.func,
    survey: React.PropTypes.object
  }

  checkForm() {
    return true
  }

  submit() {
    if (this.checkForm())
      this.props.onSubmitted({
        event_id: this.props.eventId
      })
  }

  render() {
    return (
      <div>
        <div style={BernieText.default}>
          Hi {this.props.interviewee.firstName}, my name is {this.props.currentUser.firstName} and I'm a volunteer with the Bernie Sanders campaign. I'm calling you to invite you to a {this.props.callAssignment.relatedEvent.eventType.name} on {moment(this.props.callAssignment.relatedEvent.startDate).utcOffset(this.props.callAssignment.relatedEvent.localUTCOffset).format('dddd, MMMM Do')} at {this.props.callAssignment.relatedEvent.venueAddr1}{this.currentUser.relatedPerson && this.props.callAssignment.relatedEvent.host.id === this.currentUser.relatedPerson.id ? ' that I am hosting' : ''}. [Event type specific info].
        </div>
        <GCBooleanField
          errorText={this.state.errors.signupQuestion}
          label="Can I sign you up for this event?"
          labelStyle={this.styles.question}
          value={this.state.signupQuestion}
          />
      </div>
    )
  }
}

export default Relay.createContainer(SingleEventRSVPSurvey, {
  fragments: {
    callAssignment: () => Relay.QL`
      fragment on CallAssignment {
        relatedEvent {
          host {
            id
          }
          eventType {
            name
          }
          startDate
          localUTCOffset
          venueAddr1
        }
      }
    `,
    currentUser: () => Relay.QL`
      fragment on User {
        firstName
      }
    `,
    interviewee: () => Relay.QL`
      fragment on Person {
        firstName
      }
    `,
  }
})