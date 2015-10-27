import React from 'react';
import Relay from 'react-relay';
import {TextField, DatePicker, Paper} from 'material-ui';
import moment from "moment";
import BigCalendar from 'react-big-calendar';
import BatchCreateGroupCallMutation from "../mutations/BatchCreateGroupCallMutation";

BigCalendar.setLocalizer(
  BigCalendar.momentLocalizer(moment)
);

class GroupCallCreationForm extends React.Component {
  state = {
    name: null,
    numCalls: null,
    fromDate: null,
    toDate: null,
    maxSignups: null
  }

  handleCreation = (event) => {
    Relay.Store.update(
      new BatchCreateGroupCallMutation({name: this.props.store.get('name'), numCalls: this.state.numCalls, viewer: this.props.viewer})
    );
  }

  styles = {
    container: {
      paddingLeft: 15,
      paddingTop: 15,
      paddingRight: 15,
      paddingBottom: 15
    },
    title: {
      fontWeight: "bold",
      fontSize: 30
    }
  }

  textField(label, stateKey) {
    return (
      <TextField
        hintText={label}
        value={this.state[stateKey]}
        onChange={(e) => {
          let newState = {}
          newState[stateKey] = e.target.value;
          this.setState(newState)
        }} />
    )
  }

  render() {
    return (
      <Paper zDepth={0} style={this.styles.container}>
        <div style={this.styles.title}>Create calls</div>
        <Paper style={this.styles.container}>
          <form onSubmit={this.handleCreation}>
            {this.textField('Name', 'name')}<br />
            {this.textField('# of calls', 'numCalls')}<br />
            <DatePicker
              hintText="From date"
              mode="landscape"
              value={this.state.fromDate}
              autoOk={true} />
            <DatePicker
              hintText="To date"
              mode="landscape"
              value={this.state.toDate}
              autoOk={true} />
            {this.textField('Max signups', 'maxSignups')}<br />
          </form>
        </Paper>
      </Paper>
    )
  }
}

export default Relay.createContainer(GroupCallCreationForm, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${BatchCreateGroupCallMutation.getFragment('viewer')},
      }
    `
  },
});