import React from 'react';
import Relay from 'react-relay';
import {List, ListItem, Styles} from "material-ui";

export const filterTypes = {
  UPCOMING: 'upcoming',
  PAST: 'past',
  ALL: 'all'
}

export class GroupCallInvitationList extends React.Component {
  renderGroupCallInvitations() {
    return this.props.viewer.groupCallInvitationList.edges.map(invitation =>
      <ListItem key={invitation.node.id} primaryText={invitation.node.topic} />
    );
  }

  render() {
    console.log(this.props.filter);
    let subheader = this.props.filter === "upcoming" ? "Upcoming calls" : "Past calls";
    return (
      <List subheader={subheader}>
        {this.renderGroupCallInvitations()}
      </List>
    );
  }
}

export default Relay.createContainer(GroupCallInvitationList, {
  fragments: {
    viewer: () => Relay.QL`
    fragment on Viewer {
        groupCallInvitationList(first:50, filter:"upcoming") {
          edges {
            node {
              id,
              topic,
            }
          }
        }
      }
    `
  }
});