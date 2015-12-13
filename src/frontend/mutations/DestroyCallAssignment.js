import Relay from 'react-relay';

export default class DestroyCallAssignment extends Relay.Mutation {
  static fragments = {
    callAssignment: () => Relay.QL`
      fragment on CallAssignment {
        id,
        listContainer,
      }
    `,
  }

  getMutation() {
    return Relay.QL`mutation {destroyCallAssignment}`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on DestroyCallAssignmentPayload {
        deletedCallAssignmentId,
        listContainer {
          callAssignments
        },
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'NODE_DELETE',
      parentName: 'listContainer',
      parentID: this.props.callAssignment.listContainer.id,
      connectionName: 'callAssignments',
      deletedIDFieldName: 'deletedCallAssignmentId',
    }];
  }

  getVariables() {
    return {
      callAssignmentId: this.props.callAssignment.id,
    };
  }
}
