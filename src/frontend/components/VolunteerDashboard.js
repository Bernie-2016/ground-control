import React from 'react';
import Relay from 'react-relay';
import {BernieColors} from './bernie-styles';
import {AppBar, Styles, Tabs, Tab} from 'material-ui';
import BernieLogo from './BernieLogo';

export default class VolunteerDashboard extends React.Component {
  styles = {
    logo: {
      width: 150,
      height: 63
    },
    bar: {
      position: 'relative',
      backgroundColor: BernieColors.white,
      minHeight: 56,
      height: 63
    },
    tabs: {
      color: BernieColors.gray,
      backgroundColor: Styles.Colors.white
    },
    tabsContainer: {
      verticalAlign: 'middle',
      width: 600
    }
  }
  render() {
    return (
      <div>
        <AppBar
          style={this.styles.bar}
          zDepth={0}
          title=""
          iconElementLeft={
            <BernieLogo
              color={BernieColors.blue}
              bottomSwooshColor={BernieColors.red}
              viewBox="0 0 480 200"
              style={this.styles.logo}
          />}
          iconElementRight={
            <Tabs>
              <Tab label="Make Calls" style={this.styles.tabs} />
              <Tab label="Join Group Calls" style={this.styles.tabs} />
              <Tab label="Attend Events" style={this.styles.tabs} />
              <Tab label="Share with Friends" style={this.styles.tabs} />
            </Tabs>
          }
          iconStyleRight={this.styles.tabsContainer} />
        {this.props.children}
      </div>
    )
  }
}