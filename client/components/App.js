import React from 'react';
import Relay from 'react-relay';
import GroupCallInvitationList from './GroupCallInvitationList';
import {Store} from '../store'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = new Store({});
  }

  componentDidMount() {
    this.state.on('update', () => this.forceUpdate())
  }

  render() {
    return <GroupCallInvitationList viewer={this.props.viewer} state={this.state.refine('groupCallInvitationList')} />
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

