import React from 'react';
import Relay from 'react-relay';
import CreateGroupCallInvitationMutation from '../mutations/CreateGroupCallInvitationMutation';

class GroupCallInvitationCreationForm extends React.Component {
  state = {
    topic: "A call",
    numCalls: 15,
    fromDate: "A date",
    toDate: "Another date",
    maxSignups: 20
  }

  getState(stateName) {
    if (typeof this.props.cursor.value === 'undefined' || typeof this.props.cursor.refine(stateName).value === 'undefined')
      return this.state[stateName]
    else
      return this.props.cursor.refine(stateName).value
  }

  setState(stateObject) {
    if (typeof this.props.cursor.value === 'undefined') {
      this.props.cursor.set(stateObject)
    }
    else {
      Object.keys(stateObject).forEach((key) => {
        this.props.cursor.refine(key).set(stateObject[key]);
      })
    }
  }

  handleCreation = (event) => {
    Relay.Store.update(
      new CreateGroupCallInvitationMutation({topic: this.getState('topic'), viewer: this.props.viewer})
    );
  }

  render() {
    return (
      <form onSubmit={this.handleCreation}>
        <div>
          <input type='text' placeholder='Topic' value={this.getState('topic')} onChange={e => this.setState({topic : e.target.value})}/>
        </div>
        <input type='text' placeholder='# of calls' value={this.state.numCalls} onChange={e => this.setState({numCalls : e.target.value})}/>
        calls from
        <input type='text' placeholder='From date' value={this.state.fromDate} onChange={e => this.setState({fromDate : e.target.value})}/>
        to
        <input type='text' placeholder='To date' value={this.state.toDate} onChange={e => this.setState({toDate : e.target.value})}/>
        with
        <input type='text' placeholder='Max signups' value={this.state.maxSignups} onChange={e => this.setState({maxSignups : e.target.value})}/>
        people/call
        <input type='submit' value='Done' />
      </form>
    )
  }
}

export default Relay.createContainer(GroupCallInvitationCreationForm, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${CreateGroupCallInvitationMutation.getFragment('viewer')},
      }
    `
  },
});