import Relay from 'react-relay'

export default class ChangeUserPassword extends Relay.Mutation {
  static fragments = {

  }

  getMutation() {
    return Relay.QL`
      mutation{ changeUserPassword }
    `
  }

  getFatQuery() {
    return Relay.QL`
    fragment on ChangeUserPasswordPayload {
      dummy
    }`
  }

  getConfigs() {
    return []
  }

  getVariables() {
    return {
      currentPassword: this.props.currentPassword,
      newPassword: this.props.newPassword
    }
  }
}
