import React from 'react';
import Relay from 'react-relay';

class App extends React.Component {
  render() {
    return (
      <div>
        <h1>Hello World</h1>
      </div>
    );
  }
}

export default Relay.createContainer(App, {
  fragments: {
    group: () => Relay.QL`
      fragment on GroupCallInvitation {
        topic
      }
    `,
  },
});
