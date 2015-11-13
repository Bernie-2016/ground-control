import Relay from 'react-relay';

export default class CreateCallAssignment extends Relay.Mutation {
  static fragments = {
    viewer: () => Relay.QL`
      fragment on Viewer {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`
      mutation{ createCallAssignment }
    `;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateCallAssignmentPayload {
        viewer {
          id,
          callAssignmentList
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
    return {
      name: this.props.name,
      callerGroupId: this.props.callerGroupId,
      targetGroupId: this.props.targetGroupId,
      surveyId: this.props.surveyId
    }
  }
}
