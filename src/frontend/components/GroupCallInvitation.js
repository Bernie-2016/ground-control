import React from 'react';
import Relay from 'react-relay';

export class GroupCallInvitation extends React.Component {
  render() {
    return (
      <div>
        {this.props.viewer.groupCallInvitation.topic}
      </div>
    );
  }
}

export default Relay.createContainer(GroupCallInvitation, {
  initialVariables: {
    id: null,
  },

  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        groupCallInvitation(id:$id) {
          topic
        }
      }
    `
  }
});