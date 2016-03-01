import Relay from 'react-relay';

export default class EmailHostAttendees extends Relay.Mutation {
  getMutation() {
    return Relay.QL`
      mutation{ emailHostAttendees }
    `;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on User {
        email
      }
    `;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on EmailHostAttendeesPayload {
        success,
        message
      }
    `;
  }

  getConfigs() {
    return []
  }

  getVariables() {
    console.log(this.props)
    return {
      ids: this.props.ids,
      replyTo: this.props.replyTo,
      bcc: this.props.bcc,
      subject: this.props.subject,
      message: this.props.message,
      target: this.props.target
    }
  }
}
