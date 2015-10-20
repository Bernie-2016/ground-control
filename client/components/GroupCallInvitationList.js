import React from 'react';
import Relay from 'react-relay';
import GroupCallInvitationCreationForm from './GroupCallInvitationCreationForm'

class GroupCallInvitationList extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.store);
  }

  handleCreateCall = (event) => {
//    this.props.store.set({isCreating : true});
  }

  renderGroupCallInvitations() {
    return this.props.viewer.groupCallInvitationList.edges.map(invitation =>
      <ul key={invitation.node.id}>
        {invitation.node.topic}
      </ul>
    );
  }

  render() {
    console.log('rendering 1');
    var callCreationComponent;
    if (this.props.store.get('isCreating'))
      callCreationComponent = <button onClick={this.handleCreateCall}>New Call</button>;
    else
      callCreationComponent = <GroupCallInvitationCreationForm viewer={this.props.viewer} store={this.props.store.branch('groupCallInvitationCreationForm')} />
    return (
      <div>
        {this.renderGroupCallInvitations()}
        {callCreationComponent}
      </div>
    );
  }
}

export default Relay.createContainer(GroupCallInvitationList, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${GroupCallInvitationCreationForm.getFragment('viewer')},
        groupCallInvitationList(first:10) {
          edges {
            node {
              id,
              topic,
              groupCallList(first:10) {
                edges {
                  node {
                    scheduledTime
                  }
                }
              }
            }
          }
        }
      }
    `,
  },
});

