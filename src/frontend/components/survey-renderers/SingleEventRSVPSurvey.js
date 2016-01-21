import React from 'react';
import Relay from 'react-relay';
import moment from 'moment';
import {BernieText, BernieColors} from '../styles/bernie-css';
import {Paper} from 'material-ui';
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

  eventInfo = {
    'phonebank event' : "At this phone bank party, you will get to meet other volunteers and make phone calls into the early primary states. Making these calls is the most effective way for volunteers to get Bernie elected."
  }

  state = {
    signupQuestion: null,
    errors: {}
  }

  render() {
    let relatedEvent = this.props.callAssignment.relatedEvent
    let relatedPerson = this.props.currentUser.relatedPerson
    let attendance = relatedEvent.attendeesCount
    if (relatedEvent.capacity)
      attendance = attendance + '/' + relatedEvent.capacity
    return (
      <div>
        <div style={BernieText.default}>
          Hi <strong>{this.props.interviewee.firstName}</strong>, my name is {this.props.currentUser.firstName} and I'm a volunteer with the Bernie Sanders campaign. I'm calling you to invite you to a <strong>{relatedEvent.eventType.name}</strong> on <strong>{moment(relatedEvent.startDate).utcOffset(relatedEvent.localUTCOffset).format('dddd, MMMM Do')}</strong> at <strong>{relatedEvent.venueAddr1}</strong>{relatedPerson && relatedEvent.host.id === relatedPerson.id ? ' that I am hosting' : ''}.
        </div>
        <div style={{
          ...BernieText.default,
          marginTop: 10
        }}>
          {this.eventInfo[relatedEvent.eventType.name.toLowerCase()] || '' }
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
          <Paper zDepth={0} style={{
            marginTop: 40,
            border: '1px solid ' + BernieColors.green,
            padding: '10px 10px 10px 10px'
          }}>
            <div style={{
              ...BernieText.title,
              color: BernieColors.green,
              fontSize: '1.5em'
            }}>
              Event Info
            </div>
            <div>
              <a href={relatedEvent.link} target="_blank">{relatedEvent.name}
              </a>
            </div>
            <div>{relatedEvent.venueName}</div>
            <div>{relatedEvent.venueAddr1}</div>
            <div>{relatedEvent.venueAddr2}</div>
            <div>{relatedEvent.venueCity}, {relatedEvent.venueState} {relatedEvent.venueZip}</div>
            <div>Attendance: {attendance}</div>
            <div style={{marginTop: 10}} dangerouslySetInnerHTML={{__html: relatedEvent.description}}></div>
          </Paper>
        <div>
        </div>
      </div>
    )
  }
}

export default Relay.createContainer(SingleEventRSVPSurvey, {
  fragments: {
    callAssignment: () => Relay.QL`
      fragment on CallAssignment {
        relatedEvent {
          venueAddr1
          venueAddr2
          venueCity
          venueState
          venueZip
          attendeesCount
          description
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
          name
          link
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