import React from 'react';
import Relay from 'react-relay';
import GroupCallInvitationList from './GroupCallInvitationList';
import GroupCallInvitation from './GroupCallInvitation';
import {Paper, Styles, RaisedButton} from "material-ui";

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
    },
  }

  selectInvitation(invitationId) {
    this.props.relay.setVariables({invitationId});
  }

  render() {
    return (
      <Paper style={this.styles.container}>
        <Paper zDepth={0} style={this.styles.sideBar}>
          <RaisedButton label="Create Call" fullWidth={true} primary={true} />
          <GroupCallInvitationList
            groupCallInvitationList={this.props.viewer.upcomingInvitationList}
            subheader="Upcoming calls"
            onSelect={(id) => this.selectInvitation(id)} />
          <GroupCallInvitationList
            groupCallInvitationList={this.props.viewer.pastInvitationList}
            subheader="Past calls"
            onSelect={(id) => this.selectInvitation(id)} />
        </Paper>
        <Paper zDepth={0} style={this.styles.content}>
          <GroupCallInvitation
            groupCallInvitation={this.props.viewer.groupCallInvitation} />
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
        upcomingInvitationList:groupCallInvitationList(first:50, withUpcomingGroupCalls:true) {
          ${GroupCallInvitationList.getFragment('groupCallInvitationList')}
        }
        pastInvitationList:groupCallInvitationList(first:50, withUpcomingGroupCalls:false) {
            ${GroupCallInvitationList.getFragment('groupCallInvitationList')}
        }
        groupCallInvitation(id:$invitationId) {
          ${GroupCallInvitation.getFragment('groupCallInvitation')}
        }
      }
    `,
  },
});