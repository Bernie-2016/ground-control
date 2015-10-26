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
    this.setState({isCreating: false})
    this.props.relay.setVariables({invitationId});
  }

  selectCallCreation() {
    this.setState({isCreating: true})
    this.props.relay.setVariables({invitationId: null});
  }

  render() {
    var contentView = <div></div>;
    if (this.state.isCreating)
      contentView = <GroupCallInvitationCreationForm
        viewer={this.props.viewer} />
    else if (this.props.relay.variables.invitationId)
      contentView = <GroupCallInvitation
        groupCallInvitation={this.props.viewer.groupCallInvitation} />

    return (
      <Paper style={this.styles.container}>
        <Paper zDepth={0} style={this.styles.sideBar}>
          <RaisedButton label="Create Call"
            fullWidth={true}
            primary={true}
            onTouchTap={() => this.selectCallCreation()} />
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
    invitationId: null
  },

  prepareVariables: (prev) =>
  {
    if (prev.invitationId)
      return {
        invitationId: prev.invitationId,
        fetchInvitation: true
      }
    else
      return {
        invitationId: "",
        fetchInvitation: false
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