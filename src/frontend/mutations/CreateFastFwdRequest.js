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
    return Relay.QL`
      fragment on CreateFastFwdRequestPayload {
        fastFwdRequest
      }
    `
  }

  getConfigs() {
    return []
  }

  getVariables() {
    return {
      hostMessage: this.props.hostMessage,
      eventId: this.props.eventId
    }
  }
}
