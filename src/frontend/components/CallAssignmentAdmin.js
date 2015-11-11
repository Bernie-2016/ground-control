import React from 'react';
import Relay from 'react-relay';
import CallAssignmentList from './CallAssignmentList';
import AdminSection from './AdminSection';
import AdminHelpers from './AdminHelpers';
import {RaisedButton} from 'material-ui';
import CallAssignment from './CallAssignment';

class CallAssignmentAdmin extends React.Component {
  static propTypes = {
    navigateTo: React.PropTypes.func
  }

  componentWillReceiveProps(props) {
    let id = props.path ? props.path.split('/')[0] : null
    this.props.relay.setVariables({id: id})
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  render() {
    let CallAssignmentCreationForm = (props) => {
      return <div>Create!</div>
    }
    let contentView = AdminHelpers.contentViewFromId(this.props.relay.variables.id,
      <CallAssignmentCreationForm viewer={this.props.viewer} />,
      <CallAssignment callAssignment={this.props.viewer.callAssignment} />
    )
    let sideBar = (
      <div>
        <RaisedButton label="Create Assignment"
          fullWidth={true}
          primary={true}
          onTouchTap={() => this.props.navigateTo('create')}
        />
        <CallAssignmentList
          callAssignmentList={this.props.viewer.callAssignmentList}
          subheader="Active Assignments"
          onSelect={(id) => this.props.navigateTo(id)}
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
  initialVariables: { id: null },

  prepareVariables: (prev) => AdminHelpers.variablesFromId(prev.id),

  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        callAssignmentList(first:50) {
          ${CallAssignmentList.getFragment('callAssignmentList')}
        }
        callAssignment(id:$id) @include(if: $fetchItem) {
          ${CallAssignment.getFragment('callAssignment')}
        }
      }
    `,
  },
});