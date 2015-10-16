import React from 'react';
import Relay from 'react-relay';

export class Dashboard extends React.Component {
  render() {
    return (
      <div>
        <h1>Ground Control</h1>
        {this.props.children}
      </div>
    );
  }
}