import Relay from 'react-relay';

export default class BatchCreateGroupCallMutation extends Relay.Mutation {
  static fragments = {
    viewer: () => Relay.QL`
      fragment on Viewer {
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
      fragment on BatchCreateGroupCallsPayload {
        viewer {
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
        viewer: this.props.viewer.id
      }
    }];
  }

  getVariables() {
    var groupCalls = []
    for (let i = 0; i < this.props.numCalls; i++) {
      groupCalls.push({name: "test", scheduledTime: "test", maxSignups: 15});
    }

    return {
      groupCallList: groupCalls
    };
  }
}
