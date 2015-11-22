import React from 'react';
import Relay from 'react-relay';
import Survey from './Survey'
import {BernieText} from './styles/bernie-css'
import Radium from 'radium'
import SideBarLayout from './SideBarLayout';

@Radium
class EventEditor extends React.Component {
  render() {
    return (
      <div>event editor</div>
    )
  }
}

export default Relay.createContainer(EventEditor, {
  fragments: {

  },
});