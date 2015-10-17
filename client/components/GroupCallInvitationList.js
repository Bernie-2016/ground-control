import React from 'react';
import Relay from 'react-relay';

export class GroupCallInvitationList extends React.Component {

  renderGroupCallInvitations() {
    return this.props.viewer.groupCallInvitationList.map(invitation =>
      <ul key={invitation.id}>
        {invitation.topic}
      </ul>
    );
  }

  render() {
    return (
      <div>
        {this.renderGroupCallInvitations()}
      </div>
    );
  }
}

export const GroupCallInvitationListRelay = Relay.createContainer(GroupCallInvitationList, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        groupCallInvitationList {
          id,
          topic
        }
      }
    `,
  },
});

