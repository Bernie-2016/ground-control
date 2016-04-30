import React from 'react';
import Relay from 'react-relay';

class CallAssignmentsDashboard extends React.Component {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}

export default Relay.createContainer(CallAssignmentsDashboard, {
  fragments: {
    currentUser: () => Relay.QL`
      fragment on User {
        callsMade
      }
    `
  }
})