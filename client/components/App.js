import React from 'react';
import Relay from 'react-relay';
import {Cursor} from 'react-cursor';
import GroupCallInvitationList from './GroupCallInvitationList';

class App extends React.Component {
  state = {}

  render() {
    var cursor = Cursor.build(this)
    return <GroupCallInvitationList viewer={this.props.viewer} cursor={cursor.refine('groupCallInvitationList')} />
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

