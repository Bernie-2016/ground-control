import React from 'react';
import Relay from 'react-relay';
import GroupCallInvitationList from './GroupCallInvitationList';
import GroupCallInvitation from './GroupCallInvitation';
import {Paper, Styles} from "material-ui";

export class GroupCallSection extends React.Component {
  styles = {
    container: {
      position: "relative"
    },

    sideBar: {
      display: "inline-block",
      width: 200,
      minHeight: "800px",
      border: "solid 1px " + Styles.Colors.grey300,
    },

    content: {
      display: "inline-block",
      verticalAlign: 'top'
    }
  }

  groupCallInvitationSelected(invitationId) {
    console.log(invitationId);
    this.props.relay.setVariables({invitationId});
  }

  render() {
    return (
      <Paper style={this.styles.container}>
        <Paper zDepth={0} style={this.styles.sideBar}>
          <GroupCallInvitationList viewer={this.props.viewer} withUpcomingGroupCalls={true} onSelect={(id) => this.groupCallInvitationSelected(id)} />
          <GroupCallInvitationList viewer={this.props.viewer} withUpcomingGroupCalls={false} onSelect={(id) => this.groupCallInvitationSelected(id)} />
        </Paper>
        <Paper zDepth={0} style={this.styles.content}>
          <GroupCallInvitation viewer={this.props.viewer} id={this.props.relay.variables.invitationId} />
        </Paper>
      </Paper>
    )
  }
}

export default Relay.createContainer(GroupCallSection, {
  initialVariables: {
    invitationId: "R3JvdXBDYWxsSW52aXRhdGlvbjplMGY3YzRjMy0wM2YxLTRhMzQtYmRjMC1kNGVkNTBhNDQxMWE="
  },

  fragments: {
    viewer: (variables) => Relay.QL`
      fragment on Viewer {
        ${GroupCallInvitationList.getFragment('viewer', {withUpcomingGroupCalls: true})}
        ${GroupCallInvitationList.getFragment('viewer', {withUpcomingGroupCalls: false})}
        ${GroupCallInvitation.getFragment('viewer', {id: variables.invitationId})}
      }
    `,
  },
});