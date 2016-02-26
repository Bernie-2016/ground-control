import Relay from 'react-relay';

export default class EmailHostAttendees extends Relay.Mutation {
  getMutation() {
    return Relay.QL`
      mutation{ emailHostAttendees }
    `;
  }

  getVariables() {
    return {
      ids: this.props.eventIDs,
      message: this.props.message,
      bcc: this.props.bcc,
      target: this.props.target
    }
  }
}
