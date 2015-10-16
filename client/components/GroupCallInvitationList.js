import React from 'react';
import Relay from 'react-relay';

export class GroupCallInvitationList extends React.Component {
  render() {
    return (
      <div>
        Test
      </div>
    );
  }
}

export const GroupCallInvitationListRelay = Relay.createContainer(GroupCallInvitationList, {
  fragments: {
    groupCallInvitation: () => Relay.QL`
      fragment on GroupCallInvitation {
        topic
      }
    `,
  },
});

