import React from 'react';
import Relay from 'react-relay';
import Survey from './Survey'
import {BernieText} from './styles/bernie-css'
import Radium from 'radium'
import SideBarLayout from './SideBarLayout';

@Radium
class GroupCallDashboard extends React.Component {
  render() {
    return (
      <div>group call dashboard</div>
    )
  }
}

export default Relay.createContainer(GroupCallDashboard, {
  fragments: {

  },
});