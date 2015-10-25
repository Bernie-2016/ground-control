import React from 'react';
import Relay from 'react-relay';
import {List, ListItem, Styles} from "material-ui";

export class GroupCallInvitationList extends React.Component {
  renderGroupCallInvitations() {
    return this.props.viewer.groupCallInvitationList.edges.map(invitation => {
        let node = invitation.node;
        let secondaryText = node.groupCallList.total + " calls from " + new Date(node.groupCallList.firstCallDate) + " to " + new Date(node.groupCallList.lastCallDate)
        return (
          <ListItem
            key={node.id}
            primaryText={node.topic}
            secondaryText={secondaryText} />
        )
    }
    );
  }

  render() {
    let subheader = this.props.withUpcomingGroupCalls === false ? "Past calls" : "Upcoming calls";
    return (
      <List subheader={subheader}>
        {this.renderGroupCallInvitations()}
      </List>
    );
  }
}

export default Relay.createContainer(GroupCallInvitationList, {
  initialVariables: {
    first: 50,
    withUpcomingGroupCalls: null
  },

  fragments: {
    viewer: () => Relay.QL`
    fragment on Viewer {
        groupCallInvitationList(first:50, withUpcomingGroupCalls:$withUpcomingGroupCalls) {
          edges {
            node {
              id,
              topic,
              groupCallList {
                total,
                firstCallDate,
                lastCallDate
              }
            }
          }
        }
      }
    `
  }
});