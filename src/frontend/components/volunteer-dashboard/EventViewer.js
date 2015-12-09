import React from 'react';
import Relay from 'react-relay';
import {BernieText} from './styles/bernie-css'
import Radium from 'radium'
import SideBarLayout from './SideBarLayout';

@Radium
class EventViewer extends React.Component {
  render() {
    return (
      <div>event viewer</div>
    )
  }
}

export default Relay.createContainer(EventViewer, {
  fragments: {

  },
});