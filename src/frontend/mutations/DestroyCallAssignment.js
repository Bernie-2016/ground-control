import Relay from 'react-relay';

export default class DestroyCallAssignment extends Relay.Mutation {
  static fragments = {
    callAssignment: () => Relay.QL`fragment on CallAssignment { id, listContainer { id } }`,
  };

  getFatQuery() {
    return Relay.QL`
      fragment on DestroyCallAssignmentPayload {
        destroyedCallAssignmentID
        listContainer { callAssignments },
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'NODE_DELETE',
      parentName: 'listContainer',
      parentID: this.props.callAssignment.listContainer.id,
      connectionName: 'callAssignments',
      deletedIDFieldName: 'destroyedCallAssignmentID',
    }];
  }

  getVariables() {
    return {
      callAssignmentIdToDestroy: this.props.callAssignmentId.id,
    };
  }
}
