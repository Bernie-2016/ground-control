import React from 'react';
import Relay from 'react-relay';
import {Paper, List, ListItem} from 'material-ui';
import moment from 'moment';

export class GroupCall extends React.Component {
  styles = {
    container: {
      marginLeft: 15,
      marginTop: 15,
      marginRight: 15,
      marginBottom: 15
    },
    title: {
      fontWeight: 'bold',
      fontSize: 30
    }
  }

  static propTypes = {
    groupCall: React.PropTypes.object
  }

  render() {
    return (
      <Paper style={this.styles.container} zDepth={0}>
        <div style={this.styles.title}>
          {this.props.groupCall.name}
        </div>
        <Paper zDepth={0}>
          <div>{moment(this.props.groupCall.scheduledTime).format('dddd, MMMM Do YYYY, h:mm:ss a')}
          </div>
        </Paper>
      </Paper>
    );
  }
}

export default Relay.createContainer(GroupCall, {
  fragments: {
    groupCall: () => Relay.QL`
      fragment on GroupCall {
        id
        name
        scheduledTime
      }
    `
  }
});