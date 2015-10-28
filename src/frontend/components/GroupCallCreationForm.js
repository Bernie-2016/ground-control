import React from 'react';
import Relay from 'react-relay';
import {TextField, DatePicker, Paper, List, ListItem, ListDivider, TimePicker} from 'material-ui';
import moment from "moment";
import BatchCreateGroupCallMutation from "../mutations/BatchCreateGroupCallMutation";
import GroupCallCalendar from "./GroupCallCalendar";

class GroupCallCreationForm extends React.Component {
  constructor(props) {
    super(props);
    let defaultState = {
      name: "Call name",
      numCalls: 10,
      fromDate: moment(),
      toDate: moment().add(7, "d"),
      maxSignups: 30,
      duration: moment.duration(1, "hour"),
      defaultTime: moment().hour(19).minute(0).second(0)
    };

    let callState = this.generateCalls(defaultState);
    defaultState['calls'] = callState;
    this.state = defaultState
  }

  handleCreation = (event) => {
    Relay.Store.update(
      new BatchCreateGroupCallMutation({name: this.props.store.get('name'), numCalls: this.state.numCalls, viewer: this.props.viewer})
    );
  }

  generateCalls(callInfo) {
    let numDays = callInfo.toDate.diff(callInfo.fromDate, 'days');
    let numCallsPerDay = Math.floor(callInfo.numCalls / callInfo.numDays);
    let calls = [];
    for (let index = 0; index < callInfo.numCalls; index++) {
      calls.push({
        name: callInfo.name,
        time: moment({
          year: callInfo.fromDate.year(),
          month: callInfo.fromDate.month(),
          day: callInfo.fromDate.day(),
          hour: callInfo.defaultTime.hour(),
          minute: callInfo.defaultTime.minute(),
          second: callInfo.defaultTime.second()
        }),
        maxSignups: callInfo.maxSignups,
        duration: callInfo.duration
      })
    }
    calls.sort((a, b) => b.time.diff(a))
    return calls;
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

  setStateFromInput(key, value) {
    let newState = this.state;
    newState[key] = value;
    newState['calls'] = this.generateCalls(newState)
    this.setState(newState);
  }

  textField(label, stateKey) {
    return (
      <TextField
        hintText={label}
        floatingLabelText={label}
        value={this.state[stateKey]}
        onChange={(e) => {
          this.setStateFromInput(stateKey, e.target.value)
        }} />
    )
  }

  renderCallDetails() {
    let elements = [];
    for (let index = 0; index < this.state.calls.length; index++) {
      elements.push(
        <ListItem primaryText={this.state.calls[index].name} secondaryText={this.state.calls[index].time.format("MM/DD @ h:mm a")} />
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
            onChange={(nil, date) => this.setStateFromInput(fromDate, moment(date))} />
          <DatePicker
            floatingLabelText="To date"
            hintText="To date"
            mode="landscape"
            value={this.state.toDate.toDate()}
            autoOk={true}
            onChange={(nil, date) => this.setStateFromInput(toDate, moment(date))} />
          <TimePicker
            defaultTime={this.state.defaultTime.toDate()}
            floatingLabelText="Default time"
            hintText="Default time"
            onChange={(nil, time) => this.setStateFromInput(defaultTime, moment(time))} />
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