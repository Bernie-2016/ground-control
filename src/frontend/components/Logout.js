import React from 'react';
import superagent from 'superagent';

export default class Logout extends React.Component { 
  logoutHandler = (event) => {
    superagent.get('/logout')
  }

  render() {
    let renderer = <div onLoad={(event) => {this.logoutHandler}}></div>
    return (renderer)
  }
}
