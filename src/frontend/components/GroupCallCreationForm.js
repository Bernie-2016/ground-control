import React from 'react';
import Relay from 'react-relay';
import {TextField, DatePicker, Paper, List, ListItem, ListDivider, TimePicker} from 'material-ui';
import moment from "moment";
import BatchCreateGroupCallMutation from "../mutations/BatchCreateGroupCallMutation";
import GroupCallCalendar from "./GroupCallCalendar";

class GroupCallCreationForm extends React.Component {
  state = {
    name: "A new call",
    numCalls: 10,
    fromDate: moment(),
    toDate: moment().add(7, "d"),
    maxSignups: 30,
    duration: moment.duration(1, "hour"),
    defaultTime: moment().hour(7).minute(0).second(0)
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
    },
    callList: {
      float: "right",
      marginLeft: 20,
      minWidth: 400
    },
    controlForm: {
      float: "left"
    }
  }

  textField(label, stateKey) {
    return (
      <TextField
        hintText={label}
        floatingLabelText={label}
        value={this.state[stateKey]}
        onChange={(e) => {
          let newState = {}
          newState[stateKey] = e.target.value;
          this.setState(newState)
        }} />
    )
  }

  renderCallDetails() {
    let numDays = this.state.toDate.diff(this.state.fromDate, 'days');
    let numCallsPerDay = Math.floor(this.state.numCalls / this.state.numDays);
    let iterationArray = new Array(this.state.numCalls).fill(0);
    let elements = [];
    for (let index = 0; index < this.state.numCalls; index++) {
      elements.push(
        <ListItem primaryText={this.state.name} secondaryText={this.state.fromDate.format("MM/DD @ h:mm a")} />
      )
      elements.push(<ListDivider />)
    }
    return elements;
  }

  render() {
    return (
      <Paper zDepth={0} style={this.styles.container}>
        <Paper zDepth={0} style={this.styles.controlForm}>
          {this.textField('Name', 'name')} <br />
          {this.textField('# of calls', 'numCalls')}
          <DatePicker
            floatingLabelText="From date"
            hintText="From date"
            mode="landscape"
            value={this.state.fromDate.toDate()}
            autoOk={true}
            onChange={(nil, date) => this.setState({fromDate: moment(date)})} />
          <DatePicker
            floatingLabelText="To date"
            hintText="To date"
            mode="landscape"
            value={this.state.toDate.toDate()}
            autoOk={true}
            onChange={(nil, date) => this.setState({toDate: moment(date)})} />
          <TimePicker
            defaultTime={this.state.defaultTime.toDate()}
            floatingLabelText="Default time"
            hintText="Default time"
            onChange={(nil, time) => this.setState({defaultTime: moment(time)})} />
          {this.textField('Max signups', 'maxSignups')}
        </Paper>
        <Paper style={this.styles.callList}>
          <List>
            {this.renderCallDetails()}
          </List>
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