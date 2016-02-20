import Relay from 'react-relay'

export default class CreateBoostAttendanceRequest extends Relay.Mutation {
  static fragments = {
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        id
      }
    `
  }

  getMutation() {
    return Relay.QL`
      mutation{ createBoostAttendanceRequest }
    `
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateBoostAttendanceRequestPayload {
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
    console.log('this.props')
    console.log(this.props)
    return {
      host_message: this.props.host_message,
      event_id: this.props.event_id
    }
  }
}
