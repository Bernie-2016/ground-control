import React from 'react';
import Relay from 'react-relay';
import {List, ListItem, Styles} from 'material-ui';
import moment from 'moment';

export class GroupCallList extends React.Component {
  static propTypes = {
    subheader: React.PropTypes.string,
    onSelect: React.PropTypes.func,
  }

  renderGroupCalls() {
    return this.props.groupCallList.edges.map(call => {
        let node = call.node;
        let primaryText = node.name
        let secondaryText = moment(node.scheduledTime).format('MM/DD @ h:mm a')
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
        {this.renderGroupCalls()}
      </List>
    );
  }
}

export default Relay.createContainer(GroupCallList, {
  fragments: {
    groupCallList: () => Relay.QL`
      fragment on GroupCallConnection {
        edges {
          node {
            id
            name
            scheduledTime
          }
        }
      }
    `
  }
});

