import React from 'react';
import Relay from 'react-relay';
import GroupCallInvitationCreationForm from './GroupCallInvitationCreationForm'

class GroupCallInvitationList extends React.Component {
  state = {
    isCreating: false,
  }

  getState(stateName) {
    if (typeof this.props.cursor.value === 'undefined' || typeof this.props.cursor.refine(stateName).value === 'undefined')
      return this.state[stateName]
    else
      return this.props.cursor.refine(stateName).value
  }

  setState(stateObject) {
    if (typeof this.props.cursor.value === 'undefined')
      this.props.cursor.set(stateObject)
    else
      Object.keys(stateObject).forEach((key) => {
        this.props.cursor.refine(key).set(stateObject[key]);
      })
  }

  handleCreateCall = (event) => {
    this.setState({isCreating : true});
  }

  renderGroupCallInvitations() {
    return this.props.viewer.groupCallInvitationList.edges.map(invitation =>
      <ul key={invitation.node.id}>
        {invitation.node.topic}
      </ul>
    );
  }

  render() {
    var callCreationComponent;
    if (!this.getState('isCreating'))
      callCreationComponent = <button onClick={this.handleCreateCall}>New Call</button>;
    else
      callCreationComponent = <GroupCallInvitationCreationForm viewer={this.props.viewer} cursor={this.props.cursor.refine('groupCallInvitationCreationForm')} />
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
              topic
            }
          }
        }
      }
    `,
  },
});

