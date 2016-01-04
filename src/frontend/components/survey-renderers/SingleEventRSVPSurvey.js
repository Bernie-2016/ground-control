import React from 'react';
import Relay from 'react-relay';
import moment from 'moment';
import {BernieText, BernieColors} from '../styles/bernie-css';
import GCBooleanField from '../forms/GCBooleanField';

class SingleEventRSVPSurvey extends React.Component {
  static propTypes = {
    onSubmitted: React.PropTypes.func,
    survey: React.PropTypes.object
  }

  checkForm() {
    if (this.state.signupQuestion === null) {
      this.setState({errors: {signupQuestion: 'This field is required'}})
      return false
    }
    return true;
  }

  submit() {
    if (this.checkForm())
      this.props.onSubmitted({
        event_id: this.state.signupQuestion ? this.props.callAssignment.relatedEvent.eventIdObfuscated : null
      })
  }

  // Some of this should get put into some sort of shared component
  styles = {
    question: {
      ...BernieText.secondaryTitle,
      fontWeight: 600,
      marginTop: 20,
      color: BernieColors.blue,
      fontSize: '1em',
      letterSpacing: '0em'
    }
  }

  state = {
    signupQuestion: null,
    errors: {}
  }

  render() {
    let relatedEvent = this.props.callAssignment.relatedEvent
    let relatedPerson = this.props.currentUser.relatedPerson

    return (
      <div>
        <div style={BernieText.default}>
          Hi {this.props.interviewee.firstName}, my name is {this.props.currentUser.firstName} and I'm a volunteer with the Bernie Sanders campaign. I'm calling you to invite you to a {relatedEvent.eventType.name} on {moment(relatedEvent.startDate).utcOffset(relatedEvent.localUTCOffset).format('dddd, MMMM Do')} at {relatedEvent.venueAddr1}{relatedPerson && relatedEvent.host.id === relatedPerson.id ? ' that I am hosting' : ''}. [Event type specific info].
        </div>
        <GCBooleanField
          errorText={this.state.errors.signupQuestion}
          label="Can I sign you up for this event?"
          labelStyle={this.styles.question}
          value={this.state.signupQuestion}
          onChange={(value) => {
            this.setState({
              signupQuestion: value
            })
          }}
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
          eventIdObfuscated
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
        relatedPerson {
          id
        }
      }
    `,
    interviewee: () => Relay.QL`
      fragment on Person {
        firstName
      }
    `,
  }
})