import Relay from 'react-relay'

export default class CreateFastFwdRequest extends Relay.Mutation {
  static fragments = {
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        id
      }
    `
  }

  getMutation() {
    return Relay.QL`
      mutation{ createFastFwdRequest }
    `
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateFastFwdRequestPayload {
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
      hostMessage: this.props.hostMessage,
      eventId: this.props.eventId
    }
  }
}
