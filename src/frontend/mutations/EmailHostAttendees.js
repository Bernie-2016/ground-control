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

  getConfigs() {
    return []
  }

  getVariables() {
    console.log(this.props)
    return {
      ids: this.props.ids,
      replyTo: this.props.replyTo,
      subject: this.props.subject,
      message: this.props.message,
      target: this.props.target
    }
  }
}
