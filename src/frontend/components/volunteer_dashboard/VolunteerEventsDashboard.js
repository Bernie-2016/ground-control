import React from 'react';
import Relay from 'react-relay';
import Survey from './Survey'
import {BernieText} from './styles/bernie-css'
import Radium from 'radium'
import SideBarLayout from './SideBarLayout';

@Radium
class VolunteerEventsDashboard extends React.Component {
  render() {
    return (
      <div>events dashboard content</div>
    )
  }
}

export default Relay.createContainer(VolunteerEventsDashboard, {
  fragments: {

  },
});