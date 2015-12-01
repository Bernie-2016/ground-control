import React from 'react';
import Relay from 'react-relay';
import {BernieText} from './styles/bernie-css';
import {Paper, List, ListItem} from 'material-ui';
import moment from 'moment';

export class AdminCallAssignment extends React.Component {
  render() {
    return (
      <div>
        <div style={BernieText.title}>
          {this.props.callAssignment.name}
        </div>
        <div>
          <div>Test
          </div>
        </div>
      </div>
    );
  }
}

export default Relay.createContainer(AdminCallAssignment, {
  fragments: {
    callAssignment: () => Relay.QL`
      fragment on CallAssignment {
        id
        name
      }
    `
  }
});