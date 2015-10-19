import Relay from 'react-relay';

export default class CreateGroupCallInvitationMutation extends Relay.Mutation {
  static fragments = {
    viewer: () => Relay.QL`
      fragment on Viewer {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`
      mutation{ createGroupCallInvitation }
    `;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateGroupCallInvitationPayload {
        viewer {
          id,
          groupCallInvitationList
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
      topic: this.props.topic,
    };
  }
}
