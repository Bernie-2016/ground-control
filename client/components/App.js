import React from 'react';
import Relay from 'react-relay';
import GroupCallInvitationList from './GroupCallInvitationList';
import Store from '../store'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {store: new Store({})};
  }

  componentDidMount() {
    this.state.store.on('update', () => this.forceUpdate())
  }

  render() {
    console.log('rendering');
    return <GroupCallInvitationList viewer={this.props.viewer} store={this.state.store.branch('groupCallInvitationList')} />
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

