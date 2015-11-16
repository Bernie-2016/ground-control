import React from 'react';
import Relay from 'react-relay';
import {BernieText} from './styles/bernie-css';
import {Paper, List, ListItem} from 'material-ui';
import moment from 'moment';

export class CallAssignmentViewer extends React.Component {
  render() {
    return (
      <div>
        <div style={BernieText.title}>
          {this.props.viewer.callAssignment.name}
        </div>
        <div>
          <div>Test
          </div>
        </div>
      </div>
    );
  }
}

export default Relay.createContainer(CallAssignmentViewer, {
  initialVariables: { id: null },

  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        callAssignment(id:$id) {
          id
          name
        }
      }
    `
  }
});