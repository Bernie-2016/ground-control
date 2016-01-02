import React from 'react';
import Relay from 'react-relay';
import {BernieText} from '../styles/bernie-css';

class SingleEventRSVPSurvey extends React.Component {
  static propTypes = {
    onSubmitted: React.PropTypes.func,
    survey: React.PropTypes.object
  }

  submit() {
    if (this.checkForm())
      this.props.onSubmitted({
        event_id: this.props.eventId
      })
  }

  render() {
    return (
      <div style={BernieText.default}>
        Hi.
      </div>
    )
  }
}

export default Relay.createContainer(SingleEventRSVPSurvey, {
  fragments: {
    currentUser: () => Relay.QL`
      fragment on User {
        firstName
      }
    `,
    interviewee: () => Relay.QL`
      fragment on Person {
        firstName
      }
    `
  }
})