import React from 'react';
import Relay from 'react-relay';
import Survey from './Survey'
import {BernieText} from './styles/bernie-css'
import Radium from 'radium'
import SideBarLayout from './SideBarLayout';
import RelayViewHelpers from './helpers/relay-view-helpers';
import CallAssignmentList from './CallAssignmentList';
import CallAssignment from './CallAssignment';

@Radium
class CallAssignmentDashboard extends React.Component {
  styles = {
    container: {
      paddingLeft: 40,
      paddingTop: 40,
      paddingRight: 40,
      paddingBottom: 40,
    },
    paragraph: {
      paddingTop: '0.5em',
      paddingBottom: '0.5em',
      paddingLeft: '0.5em',
      paddingRight: '0.5em',

    }
  }
  render() {
    let sideBar = (
      <div>
        <CallAssignmentList
          callAssignmentList={this.props.viewer.callAssignmentList}
          subheader="Active Assignments"
          onSelect={(id) => this.props.history.pushState(null, '/call-assignments/' + id)}
        />
      </div>
    )
    return (
      <SideBarLayout
        sideBar={sideBar}
        content={this.props.children}
      />
    )
  }
}

export default Relay.createContainer(CallAssignmentDashboard, {
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