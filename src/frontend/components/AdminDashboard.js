import React from 'react';
import Relay from 'react-relay';
import {BernieColors} from './styles/bernie-css';
import {AppBar, Styles, Tabs, Tab} from 'material-ui';
import BernieLogo from './BernieLogo';

export default class AdminDashboard extends React.Component {
  styles = {
    logo: {
      width: 96,
      height: 40
    },
    bar: {
      minHeight: 56,
      height: 56
    },
    tabs: {
      color: BernieColors.gray,
      backgroundColor: BernieColors.blue
    },
    tabsContainer: {
      width: 200
    }
  }
  render() {
    return (
      <div>
        <AppBar
          zDepth={1}
          title="Ground Control"
          iconElementLeft={
            <BernieLogo
              color={Styles.Colors.white}
              bottomSwooshColor={BernieColors.lightGray}
              viewBox="0 0 480 200"
              style={this.styles.logo}
          />}
          iconElementRight={
            <Tabs>
              <Tab label="Call Assignments"/>
              <Tab label="Group Calls" />
            </Tabs>
          }
        />
        {this.props.children}
      </div>
    )
  }
}