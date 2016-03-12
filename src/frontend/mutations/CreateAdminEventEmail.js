import Relay from 'react-relay'

export default class CreateAdminEventEmail extends Relay.Mutation {
  static fragments = {
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        id
      }
    `
  }

  getMutation() {
    return Relay.QL`
      mutation{ createAdminEventEmail }
    `
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateAdminEventEmailPayload {
        listContainer {
          id
        }
      }
    `
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        listContainer: this.props.listContainer.id
      }
    }]
  }

  getVariables() {
    return {
      hostEmail: this.props.hostEmail,
      senderEmail: this.props.senderEmail,
      adminEmail: this.props.adminEmail,
      hostEmailSubject: this.props.hostEmailSubject,
      hostMessage: this.props.hostMessage,
      senderMessage: this.props.senderMessage,
      recipients: this.props.recipients,
      toolPassword: this.props.toolPassword,
      eventId: this.props.eventId
    }
  }
}
