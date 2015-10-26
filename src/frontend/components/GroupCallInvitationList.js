import React from 'react';
import Relay from 'react-relay';
import {List, ListItem, Styles} from "material-ui";
import moment from "moment";

export class GroupCallInvitationList extends React.Component {
  renderGroupCallInvitations() {
    return this.props.viewer.groupCallInvitationList.edges.map(invitation => {
        let node = invitation.node;
        let primaryText = node.topic + ": " + node.groupCallList.total + " calls"
        let secondaryText = moment(node.groupCallList.firstCallDate).format("M/D H:mm") + " - " + moment(node.groupCallList.lastCallDate).format("M/D H:mm")
        return (
          <ListItem
            key={node.id}
            primaryText={primaryText}
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
              id
              topic
              groupCallList {
                total
                firstCallDate
                lastCallDate
              }
            }
          }
        }
      }
    `
  }
});