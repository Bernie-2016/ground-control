import React from 'react';
import Relay from 'react-relay';

export class GroupCallInvitationList extends React.Component {

  renderGroupCallInvitations() {
    console.log(this.props.groupCallInvitationList)
    return this.props.groupCallInvitationList.topic
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
    groupCallInvitationList: () => Relay.QL`
      fragment on GroupCallInvitation {
        topic
      }
    `,
  },
});

