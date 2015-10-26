import React from 'react';
import Relay from 'react-relay';
import {Paper, List, ListItem} from 'material-ui';
import moment from "moment";

export class GroupCallInvitation extends React.Component {
  styles = {
    container: {
      marginLeft: 15,
      marginTop: 15,
      marginRight: 15,
      marginBottom: 15
    },
    title: {
      fontWeight: "bold",
      fontSize: 30
    }
  }

  renderGroupCalls() {
    return this.props.groupCallInvitation.groupCallList.edges.map(callList => {
        let node = callList.node;
        let primaryText = moment(node.scheduledTime).format("dddd, MMMM Do YYYY, h:mm:ss a")
        return (
          <ListItem
            key={node.id}
            primaryText={primaryText}/>
        )
    })
  }

  render() {
    return (
      <Paper style={this.styles.container} zDepth={0}>
        <div style={this.styles.title}>
          {this.props.groupCallInvitation.topic}
        </div>
        <Paper zDepth={0}>
          <List>
            {this.renderGroupCalls()}
          </List>
        </Paper>
      </Paper>
    );
  }
}

export default Relay.createContainer(GroupCallInvitation, {
  fragments: {
    groupCallInvitation: () => Relay.QL`
      fragment on GroupCallInvitation {
        id
        topic
        groupCallList(first:50) {
          edges {
            node {
              id
              scheduledTime
              maxSignups
            }
          }
        }
      }
    `
  }
});