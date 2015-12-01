import React from 'react';
import Relay from 'react-relay';
import Survey from './Survey'
import {BernieText, BernieColors} from './styles/bernie-css'
import Radium from 'radium'
import SideBarLayout from './SideBarLayout';
import CallAssignmentList from './CallAssignmentList';
import CallAssignment from './CallAssignment';
import TopNav from './TopNav';

@Radium
export default class CallAssignmentsDashboard extends React.Component {
  render() {
    return (
      <div>
        <TopNav
          zDepth={0}
          barColor={BernieColors.lightGray}
          tabColor={BernieColors.darkGray}
          selectedTabColor={BernieColors.gray}
          logoColors={{
            primary: BernieColors.blue,
            swoosh: BernieColors.red
          }}
          tabs={[{
            value: '/call-assignments/stats',
            label: 'Stats'
          },
          {
            value: '/call-assignments/invite',
            label: 'Invite'
          },
          {
            value: '/call-assignments',
            label: 'All Assignments'
          }]}
          history={this.props.history}
          location={this.props.location}
        />
        {this.props.children}
      </div>
    )
  }
}
