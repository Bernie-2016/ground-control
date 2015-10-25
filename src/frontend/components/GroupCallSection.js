import React from 'react';
import Relay from 'react-relay';
import GroupCallInvitationList from './GroupCallInvitationList';
import {filterTypes} from './GroupCallInvitationList';
import {Paper, Styles} from "material-ui";

export class GroupCallSection extends React.Component {
  styles = {
    sideBar: {
      width: 200,
      minHeight: "800px",
      border: "solid 1px " + Styles.Colors.grey300,
    }
  }

  render() {
    return (
      <Paper zDepth={0} style={this.styles.sideBar}>
        <GroupCallInvitationList viewer={this.props.viewer} filter=filterTypes.UPCOMING />
        <GroupCallInvitationList viewer={this.props.viewer} filter=filterTypes.PAST />
      </Paper>
    )
  }
}

export default Relay.createContainer(GroupCallSection, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${GroupCallInvitationList.getFragment('viewer')}
      }
    `,
  },
});