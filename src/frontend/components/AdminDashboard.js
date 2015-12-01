import React from 'react';
import Relay from 'react-relay';
import {Styles} from 'material-ui';
import TopNav from './TopNav';
import {BernieTheme} from './styles/bernie-theme';
import {BernieColors} from './styles/bernie-css';

@Styles.ThemeDecorator(Styles.ThemeManager.getMuiTheme(BernieTheme))
export default class AdminDashboard extends React.Component {
  tabs = [
    {
      value: '/admin/call-assignments',
      label: 'Call Assignments',
    },
    {
      value: '/admin/events',
      label: 'Events',
    }
  ]

  render() {
    return (
      <div>
        <TopNav
          barColor={BernieColors.blue}
          tabColor={BernieColors.lightBlue}
          selectedTabColor={Styles.Colors.white}
          title="Ground Control"
          logoColors={{
            primary: Styles.Colors.white,
            swoosh: BernieColors.gray
          }}
          tabs={this.tabs}
          history={this.props.history}
          location={this.props.location}
        />
        {this.props.children}
      </div>
    )
  }
}