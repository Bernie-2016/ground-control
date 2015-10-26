import React from 'react';
import Relay from 'react-relay';
import {List, ListItem, Styles} from "material-ui";
import moment from "moment";

export class GroupCallInvitationList extends React.Component {
  renderGroupCallInvitations() {
    return this.props.groupCallInvitationList.edges.map(invitation => {
        let node = invitation.node;
        let primaryText = node.topic + ": " + node.groupCallList.total + " calls"
        let secondaryText = moment(node.groupCallList.firstCallDate).format("M/D H:mm") + " - " + moment(node.groupCallList.lastCallDate).format("M/D H:mm")
        return (
          <ListItem
            key={node.id}
            primaryText={primaryText}
            secondaryText={secondaryText}
            onClick={(e) => this.props.onSelect(node.id)}/>
        )
    }
    );
  }

  render() {
    return (
      <List subheader={this.props.subheader}>
        {this.renderGroupCallInvitations()}
      </List>
    );
  }
}

export default Relay.createContainer(GroupCallInvitationList, {
  fragments: {
    groupCallInvitationList: () => Relay.QL`
      fragment on GroupCallInvitationConnection {
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
    `
  }
});