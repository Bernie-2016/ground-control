import React from 'react';
import Relay from 'react-relay';

class App extends React.Component {
  render() {
    return (
      <div>
        <h1>hi</h1>
      </div>
    );
  }
}

export default Relay.createContainer(App, {
  fragments: {
    groupCallInvitation: () => Relay.QL`
      fragment on GroupCallInvitation {
        topic
      }
    `,
  },
});
