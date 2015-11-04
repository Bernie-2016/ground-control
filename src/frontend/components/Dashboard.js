import React from 'react';
import Relay from 'react-relay';
import {AppBar, Styles, FlatButton, Tabs, Tab, AppCanvas} from 'material-ui';
import BernieLogo from './BernieLogo';
import {BernieColors} from './bernie-styles'

export default class Dashboard extends React.Component {


  render() {
    return (

        {this.props.children}

    );
  }
}