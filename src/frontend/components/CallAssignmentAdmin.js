import React from 'react';
import Relay from 'react-relay';
import CallAssignmentList from './CallAssignmentList';
import AdminSection from './AdminSection';
import {RaisedButton} from 'material-ui';

class CallAssignmentAdmin extends React.Component {
  static propTypes = {
    navigateTo: React.PropTypes.func
  }

  componentWillReceiveProps(props) {
    let assignmentId = props.path ? props.path.split('/')[0] : null
    this.props.relay.setVariables({assignmentId: assignmentId})
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  selectAssignment(assignmentId) {
    this.props.navigateTo(assignmentId)
  }

  selectAssignmentCreation() {
    this.props.navigateTo('create')
  }

  render() {
    let contentView = <div></div>;
    let sideBar = (
      <div>
        <RaisedButton label="Create Assignment"
          fullWidth={true}
          primary={true}
          onTouchTap={() => this.selectAssignmentCreation()}
        />
        <CallAssignmentList
          callAssignmentList={this.props.viewer.callAssignmentList}
          subheader="Active Assignments"
          onSelect={(id) => this.selectAssignment(id)}
        />
      </div>
    )
    return (
      <AdminSection
        sideBar={sideBar}
        content={contentView}
      />
    )
  }
}

export default Relay.createContainer(CallAssignmentAdmin, {
  initialVariables: {
    assignmentId: null
  },

  prepareVariables: (prev) =>
  {
    if (prev.assignmentId && prev.assignmentId !== 'create')
      return {
        assignmentId: prev.assignmentId,
        fetchCall: true
      }
    else
      return {
        assignmentId: '',
        fetchCall: false
      }
  },

  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        callAssignmentList(first:50) {
          ${CallAssignmentList.getFragment('callAssignmentList')}
        }
      }
    `,
  },
});