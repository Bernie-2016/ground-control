import React from 'react';
import Relay from 'react-relay';
import {AppBar, Styles, FlatButton, Tabs, Tab, AppCanvas} from 'material-ui';
import BernieLogo from './BernieLogo';

export default class Dashboard extends React.Component {
  styles = {
    logo: {
      width: 96,
      height: 40
    },
    bar: {
      backgroundColor: "rgb(20, 127, 215)",
      minHeight: 56,
      height: 56
    },
    tabs: {
      backgroundColor: "rgb(20, 127, 215)"
    },
    tabsContainer: {
      width: 200
    }
  }

  render() {
    return (
      <div>
        <AppBar
          style={this.styles.bar}
          zDepth={1}
          title="Ground Control"
          iconElementLeft={
            <BernieLogo color={Styles.Colors.white}
              viewBox="0 0 480 200"
              style={this.styles.logo}
          />}
          iconElementRight={
            <Tabs>
              <Tab label="Group Calls" style={this.styles.tabs} />
            </Tabs>
          }
          iconStyleRight={this.styles.tabsContainer}
        >
        </AppBar>
        {this.props.children}
      </div>
    );
  }
}