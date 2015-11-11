import React from 'react';
import Relay from 'react-relay';
import {List, ListItem, Styles} from 'material-ui';
import moment from 'moment';

export class CallAssignmentList extends React.Component {
  static propTypes = {
    subheader: React.PropTypes.string,
    onSelect: React.PropTypes.func,
  }

  renderCallAssignments() {
    return this.props.callAssignmentList.edges.map(assignment => {
        let node = assignment.node;
        let primaryText = node.name
        let secondaryText = 'What'
        return (
          <ListItem
            key={node.id}
            primaryText={primaryText}
            secondaryText={secondaryText}
            onTouchTap={(e) => this.props.onSelect(node.id)}/>
        )
      }
    );
  }

  render() {
    return (
      <List subheader={this.props.subheader}>
        {this.renderCallAssignments()}
      </List>
    );
  }
}

export default Relay.createContainer(CallAssignmentList, {
  fragments: {
    callAssignmentList: () => Relay.QL`
      fragment on CallAssignmentConnection {
        edges {
          node {
            id
            name
          }
        }
      }
    `
  }
});

