import React from 'react';
import Relay from 'react-relay';
import {Subheader, List, ListItem, Styles} from 'material-ui';
import moment from 'moment';
import {BernieColors} from './styles/bernie-css';

export class CallAssignmentList extends React.Component {
  static propTypes = {
    subheader: React.PropTypes.string,
    onSelect: React.PropTypes.func,
  }

  renderCallAssignments() {
    return this.props.callAssignments.edges.map(assignment => {
        let node = assignment.node;
        let s = node.callsMade === 1 ? '' : 's'
        let primaryText = node.name
        let secondaryText = `${node.callsMade} call${s} made by everyone`
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
      <List>
        <div style={{
          color: BernieColors.gray,
          marginLeft: 15
        }}>
          {this.props.subheader}
        </div>
        {this.renderCallAssignments()}
      </List>
    );
  }
}

export default Relay.createContainer(CallAssignmentList, {
  fragments: {
    callAssignments: () => Relay.QL`
      fragment on CallAssignmentConnection {
        edges {
          node {
            id
            name
            callsMade
          }
        }
      }
    `
  }
});

