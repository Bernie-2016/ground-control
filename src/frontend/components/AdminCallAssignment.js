import React from 'react';
import Relay from 'react-relay';
import {BernieText} from './styles/bernie-css';
import {Paper, List, ListItem} from 'material-ui';
import moment from 'moment';
import {Link} from 'react-router'

export class AdminCallAssignment extends React.Component {
  render() {
    return (
      <div>
        <div style={BernieText.title}>
          {this.props.callAssignment.name}
        </div>
        <div>
          <div>
            Using survey: {this.props.callAssignment.survey.fullURL}<br/>
            Using query: {this.props.callAssignment.query}
            <div>
              <Link to={`/call/${this.props.callAssignment.id}`}> Assignment link</Link>
            </div>
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
        survey {
          fullURL
        }
        query
      }
    `
  }
});