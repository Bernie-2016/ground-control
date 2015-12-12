import React from 'react';
import Relay from 'react-relay';
import CallAssignmentList from './CallAssignmentList';
import SideBarLayout from './SideBarLayout';
import {RaisedButton} from 'material-ui';
import AdminCallAssignment from './AdminCallAssignment';
import AdminCallAssignmentCreationForm from './AdminCallAssignmentCreationForm';
import {BernieLayout} from './styles/bernie-css';

class AdminCallAssignmentAdmin extends React.Component {
  render() {
    let sideBar = (
      <div>
        <RaisedButton label="Create Assignment"
          fullWidth={true}
          primary={true}
          onTouchTap={() => this.props.history.push('/admin/call-assignments/create')}
        />
        <CallAssignmentList
          callAssignments={this.props.listContainer.callAssignments}
          subheader="Active Assignments"
          onSelect={(id) => this.props.history.push('/admin/call-assignments/' + id)}
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

export default Relay.createContainer(AdminCallAssignmentAdmin, {
  fragments: {
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        callAssignments(first:50) {
          ${CallAssignmentList.getFragment('callAssignments')}
        }
      }
    `,
  },
});