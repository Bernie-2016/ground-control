import React from 'react';
import Relay from 'react-relay';
import GroupCallInvitationList from './GroupCallInvitationList';
import GroupCallInvitation from './GroupCallInvitation';
import GroupCallInvitationCreationForm from "./GroupCallInvitationCreationForm";
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

  state = {
    isCreating: false
  }

  selectInvitation(invitationId) {
    this.props.relay.setVariables({invitationId});
  }

  render() {
    var contentView;
    if (this.state.isCreating)
      contentView = <GroupCallInvitation
        groupCallInvitation={this.props.viewer.groupCallInvitation} />
    else
      contentView = <GroupCallInvitationCreationForm
        viewer={this.props.viewer} />

    return (
      <Paper style={this.styles.container}>
        <Paper zDepth={0} style={this.styles.sideBar}>
          <RaisedButton label="Create Call"
            fullWidth={true}
            primary={true}
            onClick={() => this.setState({isCreating: true})} />
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
          {contentView}
        </Paper>
      </Paper>
    )
  }
}

export default Relay.createContainer(GroupCallSection, {
  initialVariables: {
    invitationId: "",
  },

  prepareVariables: (prev) =>
  {
    var fetchInvitation = true;
    if (prev.invitationId === "")
      fetchInvitation = false;
    return {
      invitationId: prev.invitationId,
      fetchInvitation: fetchInvitation
    }
  },

  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        upcomingInvitationList:groupCallInvitationList(first:50, withUpcomingGroupCalls:true) {
          ${GroupCallInvitationList.getFragment('groupCallInvitationList')}
        }
        pastInvitationList:groupCallInvitationList(first:50, withUpcomingGroupCalls:false) {
            ${GroupCallInvitationList.getFragment('groupCallInvitationList')}
        }
        groupCallInvitation(id:$invitationId) @include(if: $fetchInvitation) {
          ${GroupCallInvitation.getFragment('groupCallInvitation')}
        }
        ${GroupCallInvitationCreationForm.getFragment('viewer')}
      }
    `,
  },
});