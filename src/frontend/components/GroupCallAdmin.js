import React from 'react';
import Relay from 'react-relay';
import GroupCallList from './GroupCallList';
import GroupCall from './GroupCall';
import GroupCallCreationForm from './GroupCallCreationForm';
import {RaisedButton} from 'material-ui';
import SideBarLayout from './SideBarLayout';
import {BernieLayout} from './styles/bernie-css';

export class GroupCallAdmin extends React.Component {
  render() {
    let sideBar = (
      <div>
        <RaisedButton label="Create Calls"
          fullWidth={true}
          primary={true}
          onTouchTap={() => this.props.history.pushState(null, '/admin/group-calls/create')}
        />
        <GroupCallList
          groupCallList={this.props.listContainer.upcomingCallList}
          subheader="Upcoming calls"
          onSelect={(id) => this.props.history.pushState(null, '/admin/group-calls/' + id)}
        />
        <GroupCallList
          groupCallList={this.props.listContainer.pastCallList}
          subheader="Past calls"
          onSelect={(id) => this.props.history.pushState(null, '/admin/group-calls/' + id)}
        />
      </div>
    )

    return (
      <SideBarLayout
        sideBar={sideBar}
        content={this.props.children}
        contentViewStyle={BernieLayout.admin.sideBarContentView}
      />
    )
  }
}

export default Relay.createContainer(GroupCallAdmin, {
  fragments: {
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        upcomingCallList:groupCallList(first:50, upcoming:true) {
          ${GroupCallList.getFragment('groupCallList')}
        }
        pastCallList:groupCallList(first:50, upcoming:false) {
          ${GroupCallList.getFragment('groupCallList')}
        }
      }
    `,
  },
});