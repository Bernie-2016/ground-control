import Relay from 'react-relay'

export default class CreateFastFwdRequest extends Relay.Mutation {
  static fragments = {
  }

  getMutation() {
    return Relay.QL`
      mutation{ createFastFwdRequest }
    `
  }

  getFatQuery() {
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
      hostMessage: this.props.hostMessage,
      eventId: this.props.eventId
    }
  }
}
