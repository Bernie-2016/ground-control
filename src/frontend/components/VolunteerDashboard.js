import React from 'react';
import Relay from 'react-relay';
import {Styles} from 'material-ui';
import GroupCallAdmin from './GroupCallAdmin';
import CallAssignmentAdmin from './CallAssignmentAdmin';
import TopBar from './TopBar';
import {BernieTheme} from './styles/bernie-theme';
import {BernieColors} from './styles/bernie-css';

@Styles.ThemeDecorator(Styles.ThemeManager.getMuiTheme(BernieTheme))
export default class VolunteerDashboard extends React.Component {
  tabs = [{
      value:'/call-assignments',
      label: 'Make Calls',
    },
    {
      value: '/group-calls',
      label: 'Join Group Calls'
    },
    {
      value: 'http://map.berniesanders.com',
      label: 'Attend Events'
    },
    {
      value: 'https://go.berniesanders.com/page/share/share-for-bernie?source=homepage_organize',
      label: 'Share with Friends'
    },
  ]

  render() {
    return (
      <div>
        <TopBar
          zDepth={1}
          barColor={BernieColors.lightGray}
          tabColor={BernieColors.darkGray}
          selectedTabColor={BernieColors.gray}
          logoColors={{
            primary: BernieColors.blue,
            swoosh: BernieColors.red
          }}
          tabs={this.tabs}
          history={this.props.history}
          location={this.props.location}
        />

      </div>
    )
  }
}