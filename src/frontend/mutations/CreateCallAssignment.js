import Relay from 'react-relay';

export default class CreateCallAssignment extends Relay.Mutation {
  static fragments = {
    listContainer: () => Relay.QL`
      fragment on ListContainer {
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
        listContainer {
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
        listContainer: this.props.listContainer.id
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
