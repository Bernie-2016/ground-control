import React from 'react';
import Relay from 'react-relay';
import GroupCallInvitationCreationForm from './GroupCallInvitationCreationForm'
import {List, ListItem, Styles} from "material-ui";

export class GroupCallInvitationList extends React.Component {
  styles = {
    list: {
      width: 200,
      minHeight: "800px",
      border: "solid 1px " + Styles.Colors.grey300,
    }
  }

  state = {
    isCreating: false
  }

  handleCreateCall = (event) => {
    this.setState({isCreating: true})
  }

  renderGroupCallInvitations() {
    return this.props.viewer.groupCallInvitationList.edges.map(invitation =>
      <ListItem primaryText={invitation.node.topic} />
    );
  }

  render() {
    let menuItems = [
      { route: 'get-started', text: 'Get Started' }
    ];
    return (
      <List style={this.styles.list} subheader="Upcoming calls">
        {this.renderGroupCallInvitations()}
      </List>
    )
  }
}

export const GroupCallInvitationListRelay = Relay.createContainer(GroupCallInvitationList, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${GroupCallInvitationCreationForm.getFragment('viewer')},
        groupCallInvitationList(first:10) {
          edges {
            node {
              id,
              topic,
              groupCallList(first:10) {
                edges {
                  node {
                    scheduledTime
                  }
                }
              }
            }
          }
        }
      }
    `,
  },
});
