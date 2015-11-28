import React from 'react';
import Relay from 'react-relay';
import Survey from './Survey'
import {BernieText, BernieColors} from './styles/bernie-css'
import Radium from 'radium'
import SideBarLayout from './SideBarLayout';
import CallAssignmentList from './CallAssignmentList';
import CallAssignment from './CallAssignment';
import TopNav from './TopNav';
import Signup from './Signup';

class CallAssignmentListViewer extends React.Component {
  styles = {
    container: {
      paddingLeft: 40,
      paddingTop: 40,
      paddingRight: 40,
      paddingBottom: 40,
    },
  }

  // This logic should probably happen on 401 at the relay network layer
  componentWillMount() {
    if (!this.props.currentUser) {
      this.props.history.pushState(null, '/signup');
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.currentUser) {
      this.props.history.pushState(null, '/signup');
    }
  }

  render() {
    let sideBar = (
      <div>
        <CallAssignmentList
          callAssignmentList={this.props.listContainer.callAssignmentList}
          subheader="Active Assignments"
          onSelect={(id) => this.props.history.pushState(null, '/call-assignments/' + id)}
        />
      </div>
    )

    let content = (
      <div>
        <div style={BernieText.title}>
          Let them hear you loud and clear.
        </div>
        <div style={BernieText.default}>
          Getting Bernie's message out is the single most important action you can take. Here are some instructions to help you get started and words of encouragement.  Click an assignment from the side bar to get started.  Also here are some links to webinars, phonebank codes, and everything else that we have on our website.
        </div>
      </div>
    )

    return (
      <div>
        <SideBarLayout
          sideBar={sideBar}
          content={content}
          contentViewStyle={this.styles.container}
        />
      </div>
    )
  }
}

export default Relay.createContainer(CallAssignmentListViewer, {
  fragments: {
    currentUser: () => Relay.QL`
      fragment on Person {
        callAssignmentList(first:50) {
          ${CallAssignmentList.getFragment('callAssignmentList')}
        }
      }
    `,
  },
});