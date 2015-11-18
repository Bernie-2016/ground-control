import React from 'react';
import Relay from 'react-relay';
import CallAssignmentList from './CallAssignmentList';
import SideBarLayout from './SideBarLayout';
import {RaisedButton} from 'material-ui';
import CallAssignment from './CallAssignment';
import CallAssignmentCreationForm from './CallAssignmentCreationForm';
import {BernieLayout} from './styles/bernie-css';

class CallAssignmentAdmin extends React.Component {
  render() {
    let sideBar = (
      <div>
        <RaisedButton label="Create Assignment"
          fullWidth={true}
          primary={true}
          onTouchTap={() => this.props.history.pushState(null, '/admin/call-assignments/create')}
        />
        <CallAssignmentList
          callAssignmentList={this.props.listContainer.callAssignmentList}
          subheader="Active Assignments"
          onSelect={(id) => this.props.history.pushState(null, '/admin/call-assignments/' + id)}
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

export default Relay.createContainer(CallAssignmentAdmin, {
  fragments: {
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        callAssignmentList(first:50) {
          ${CallAssignmentList.getFragment('callAssignmentList')}
        }
      }
    `,
  },
});