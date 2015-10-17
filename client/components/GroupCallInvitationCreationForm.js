import React from 'react';
import Relay from 'react-relay';

export class GroupCallInvitationCreationForm extends React.Component {

  state = {
    topic: "A call",
    numCalls: 15,
    fromDate: "A date",
    toDate: "Another date",
    maxSignups: 20
  }

  handleCreation = (event) => {
    console.log(this.state.topic);
  }

  render() {
    return (
      <form onSubmit={this.handleCreation}>
        <div>
          <input type='text' placeholder='Topic' value={this.state.topic} onChange={e => this.setState({topic : e.target.value})}/>
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