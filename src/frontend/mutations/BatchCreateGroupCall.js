import Relay from 'react-relay';

export default class BatchCreateGroupCall extends Relay.Mutation {
  static fragments = {
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`
      mutation{ batchCreateGroupCall }
    `;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on BatchCreateGroupCallPayload {
        listContainer {
          id,
          groupCallList
        },
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        listContainer: this.props.listContainer.id
      }
    }];
  }

  getVariables() {
    let inputCalls = []
    this.props.calls.forEach((call) => {
      inputCalls.push({
        name: call.name,
        scheduledTime: call.scheduledTime.toDate().getTime(),
        maxSignups: call.maxSignups,
        duration: 60
      })
    });
    return {
      groupCallList: inputCalls
    };
  }
}
