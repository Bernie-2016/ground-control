import React from 'react';
import Relay from 'react-relay';
import Freezer from 'freezer-js';
import GroupCallInvitationList from './GroupCallInvitationList';

class App extends React.Component {
  constructor(props) {
    super(props);
    var initialState = {
      'groupCallInvitationList' : {}
    }
    var freezer = new Freezer(initialState)
    this.state = {
      store: freezer,
    };
  }

  componentDidMount() {
    this.state.store.on('update', () => {
      this.forceUpdate()
    });
  }

  render() {
    var state = this.state.store.get();
    return <GroupCallInvitationList viewer={this.props.viewer} state={state.groupCallInvitationList} />
  }
}

export default Relay.createContainer(App, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${GroupCallInvitationList.getFragment('viewer')}
      }
    `
  }
})

