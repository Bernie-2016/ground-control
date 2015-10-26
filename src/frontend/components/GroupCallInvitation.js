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
    },
    callList: {
      width: 800
    }
  }

  renderGroupCalls() {
    return this.props.viewer.groupCallInvitation.groupCallList.edges.map(callList => {
        let node = callList.node;
        console.log(node.id)      ;
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
          {this.props.viewer.groupCallInvitation.topic}
        </div>
        <Paper>
          <List style={this.styles.callList}>
            {this.renderGroupCalls()}
          </List>
        </Paper>
      </Paper>
    );
  }
}

export default Relay.createContainer(GroupCallInvitation, {
  initialVariables: {
    id: null,
  },

  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        groupCallInvitation(id:$id) {
          id
          topic
          groupCallList(first:50) {
            edges {
              node {
                scheduledTime
                maxSignups
              }
            }
          }
        }
      }
    `
  }
});