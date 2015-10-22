import React from 'react';
import Relay from 'react-relay';
import GroupCallInvitationCreationForm from './GroupCallInvitationCreationForm'
import {Nav, NavItem} from "react-bootstrap";

export class GroupCallInvitationList extends React.Component {

  state = {
    isCreating: false
  }

  handleCreateCall = (event) => {
    this.setState({isCreating: true})
  }

  renderGroupCallInvitations() {
    return this.props.viewer.groupCallInvitationList.edges.map(invitation =>
      <NavItem eventKey={invitation.node.id}>
        {invitation.node.topic}
      </NavItem>
    );
  }

  render() {
    var callCreationComponent;
    if (!this.state.isCreating)
      callCreationComponent = <button onClick={this.handleCreateCall}>New Call</button>;
    else
      callCreationComponent = <GroupCallInvitationCreationForm viewer={this.props.viewer} />
    return (
      <div class="row">
        <div class="col-md-4">
          <Nav bsStyle="pills" bsSize="xsmall" stacked>
            {this.renderGroupCallInvitations()}
          </Nav>
        </div>
        <div class="col-md-8">
          {callCreationComponent}
        </div>
      </div>
    );
  }
}

export const GroupCallInvitationListRelay = Relay.createContainer(GroupCallInvitationList, {
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

