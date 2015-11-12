import Relay from 'react-relay';

export default class BatchCreateGroupCall extends Relay.Mutation {
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
      fragment on BatchCreateGroupCallPayload {
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
