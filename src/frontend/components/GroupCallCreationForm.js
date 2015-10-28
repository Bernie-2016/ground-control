import React from 'react';
import Relay from 'react-relay';
import {TextField, SvgIcon, DatePicker, Paper, List, FloatingActionButton, Styles, ListItem, ListDivider, TimePicker, RaisedButton} from 'material-ui';
import moment from "moment";
import BatchCreateGroupCallMutation from "../mutations/BatchCreateGroupCallMutation";

class GroupCallCreationForm extends React.Component {
  constructor(props) {
    super(props);
    let defaultState = {
      name: "A new conference",
      numCalls: 1,
      fromDate: moment(),
      toDate: moment().add(7, "d"),
      maxSignups: 30,
      duration: moment.duration(1, "hour"),
      defaultTime: moment().hour(19).minute(0).second(0),
      selectedIndex: null
    };

    let callState = this.generateCalls(defaultState);
    defaultState['calls'] = callState;
    this.state = defaultState
  }

  onCreate = (event) => {
    Relay.Store.update(
      new BatchCreateGroupCallMutation({calls:this.state.calls, viewer: this.props.viewer})
    );
  }

  generateCalls(callInfo) {
    let names = callInfo.name.split(';');
    let numDays = callInfo.toDate.diff(callInfo.fromDate, 'days');
    let calls = [];
    for (let index = 0; index < callInfo.numCalls; index++) {
      let name = index < names.length ? names[index] : names[names.length-1]
      let call = {
        name: name.trim(),
        scheduledTime: moment({
          year: callInfo.fromDate.year(),
          month: callInfo.fromDate.month(),
          day: callInfo.fromDate.date(),
          hour: callInfo.defaultTime.hour(),
          minute: callInfo.defaultTime.minute(),
          second: callInfo.defaultTime.second()
        }),
        maxSignups: callInfo.maxSignups,
        duration: callInfo.duration
      };
      let dayOffset = index % numDays;
      call.scheduledTime.add(dayOffset, "d");
      calls.push(call);
    }
    calls.sort((a, b) => a.scheduledTime.diff(b.scheduledTime))
    return calls;
  }

  styles = {
    container: {
      paddingLeft: 15,
      paddingTop: 15,
      paddingRight: 15,
      paddingBottom: 15,
      position: "relative",
      minHeight: 800
    },
    title: {
      fontWeight: "bold",
      fontSize: 30
    },
    callList: {
      position: "absolute",
      top: 15,
      left: 295,
      marginLeft: 20,
      minWidth: 400,
      zIndex: 0,
      border: "solid 1px " + Styles.Colors.grey300,
    },
    callForm: {
      position: "fixed",
      top: 80,
      width: 280,
      paddingLeft: 15,
      paddingTop: 15,
      paddingRight: 15,
      paddingBottom: 15,
      border: "solid 1px " + Styles.Colors.grey300,
      zIndex: 10
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

  setSelectedCall(callIndex) {
    this.setState({selectedIndex: callIndex});
  }

  renderCallDetails() {
    let elements = [];
    for (let index = 0; index < this.state.calls.length; index++) {
      elements.push(
        <ListItem
          primaryText={this.state.calls[index].name}
          secondaryText={this.state.calls[index].scheduledTime.format("MM/DD @ h:mm a")}
          key={index}
          onTouchTap={(e) => this.setSelectedCall(index)} />
      )
      elements.push(<ListDivider />)
    }
    return elements;
  }

  closeButton() {
    return (
      <SvgIcon {...this.props}>
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </SvgIcon>
    );
  }

  generateCallsForm() {
    return (
      <div>
        <RaisedButton label="Create!"
          fullWidth={true}
          primary={true}
          onTouchTap={(event) => this.onCreate(event)} />
        {this.textField('Name', 'name')} <br />
        {this.textField('# of calls', 'numCalls')}
        <DatePicker
          floatingLabelText="From date"
          hintText="From date"
          mode="landscape"
          value={this.state.fromDate.toDate()}
          autoOk={true}
          onChange={(nil, date) => this.setStateFromInput("fromDate", moment(date))} />
        <DatePicker
          floatingLabelText="To date"
          hintText="To date"
          mode="landscape"
          value={this.state.toDate.toDate()}
          autoOk={true}
          onChange={(nil, date) => this.setStateFromInput("toDate", moment(date))} />
        <TimePicker
          defaultTime={this.state.defaultTime.toDate()}
          floatingLabelText="Default time"
          hintText="Default time"
          onChange={(nil, time) => this.setStateFromInput("defaultTime", moment(time))} />
        {this.textField('Max signups', 'maxSignups')}
      </div>
    )
  }

  generateIndividualCallForm(callIndex) {
    let call = this.state.calls[callIndex];
    return (
      <div>
        <FloatingActionButton mini={true} style={{float:"right"}} onTouchTap={() => this.setSelectedCall(null)}>
          {this.closeButton()}
        </FloatingActionButton>
        <TextField
          hintText="Name"
          floatingLabelText="Name"
          value={call.name}
          onChange={(e) => {
            let calls = this.state.calls
            calls[callIndex]['name'] = e.target.value
            this.setState({calls: calls})}} /> <br />
        <TextField
          hintText="Max signups"
          floatingLabelText="Max signups"
          value={call.maxSignups}
          onChange={(e) => {
            let calls = this.state.calls
            calls[callIndex]['maxSignups'] = e.target.value
            this.setState({calls: calls})}} />
        <DatePicker
          floatingLabelText="Scheduled date"
          hintText="Scheduled date"
          mode="landscape"
          value={moment(call.scheduledTime).startOf('day').toDate()}
          autoOk={true}
          onChange={(nil, date) => {
            let calls = this.state.calls;
            let newMoment = moment(date);
            calls[callIndex]['scheduledTime'] = moment({
              year: newMoment.year(),
              month: newMoment.month(),
              day: newMoment.date(),
              hour: call.scheduledTime.hour(),
              minute: call.scheduledTime.minute(),
              second: call.scheduledTime.second()
            })
            calls.sort((a, b) => a.scheduledTime.diff(b.scheduledTime))
            this.setState({calls: calls})
          }} />
          <TimePicker
            floatingLabelText="Scheduled time"
            hintText="Scheduled time"
            defaultTime={moment(call.scheduledTime).toDate()}
            onChange={(nil, time) => {
              let calls = this.state.calls;
              let newMoment = moment(time);
              calls[callIndex]['scheduledTime'] = moment({
                year: call.scheduledTime.year(),
                month: call.scheduledTime.month(),
                day: call.scheduledTime.date(),
                hour: newMoment.hour(),
                minute: newMoment.minute(),
                second: newMoment.second()
              })
            calls.sort((a, b) => a.scheduledTime.diff(b.scheduledTime))
            this.setState({calls: calls})
          }} />
      </div>
    )
  }

  render() {
    let inputZDepth=1
    let callForm = null;
    if (this.state.selectedIndex !== null) {
      inputZDepth = 1;
      callForm = this.generateIndividualCallForm(this.state.selectedIndex)
    }
    else {
      inputZDepth = 0;
      callForm = this.generateCallsForm()
    }

    return (
      <Paper zDepth={0} style={this.styles.container}>
        <Paper zDepth={inputZDepth} style={this.styles.callForm}>
          {callForm}
        </Paper>
        <Paper zDepth={0} style={this.styles.callList}>
          {this.renderCallDetails()}
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