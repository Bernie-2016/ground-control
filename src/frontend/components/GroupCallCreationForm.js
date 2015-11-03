import React from 'react';
import Relay from 'react-relay';
import {TextField, SvgIcon, DatePicker, Paper, List, FloatingActionButton, Styles, ListItem, ListDivider, TimePicker, RaisedButton, Snackbar} from 'material-ui';
import moment from "moment";
import BatchCreateGroupCallMutation from "../mutations/BatchCreateGroupCallMutation";
import {BernieColors} from './bernie-styles'

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
      selectedCall: null,
      globalErrorMessage: null,
      globalStatusMessage: null
    };

    let callState = this.generateCalls(defaultState);
    defaultState['calls'] = callState;
    this.state = defaultState
  }

  static propTypes = {
    viewer: React.PropTypes.object
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
      zIndex: 1
    }
  }

  onCreate = (event) => {
    this.setState({
      globalErrorMessage: null,
      globalStatusMessage: null
    });

    let onFailure = (transaction) => {
      var error = transaction.getError() || new Error('Mutation failed.');
      this.setState({globalErrorMessage : "Something went wrong trying to make the calls."})
    };

    let onSuccess = (transaction) => {
      this.setState({globalStatusMessage : "Calls created successfully!"})
    }

    Relay.Store.update(
      new BatchCreateGroupCallMutation({
        calls:this.state.calls,
        viewer: this.props.viewer,
      }),
      {onFailure}
    );
  }

  generateCalls(callInfo) {
    let names = callInfo.name.split(';');
    let numDays = callInfo.toDate.diff(callInfo.fromDate, 'days');
    let calls = [];
    for (let index = 0; index < callInfo.numCalls; index++) {
      let name = index < names.length ? names[index] : names[names.length-1]
      let call = {
        id: Math.random().toString(36).substring(7),
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

  setSelectedCall(callId) {
    this.setState({selectedCall: callId});
  }

  generatedCallsList() {
    let elements = [];
    for (let index = 0; index < this.state.calls.length; index++) {
      elements.push(
        <ListItem
          primaryText={this.state.calls[index].name}
          secondaryText={this.state.calls[index].scheduledTime.format("MM/DD @ h:mm a")}
          key={this.state.calls[index].id}
          onTouchTap={(e) => this.setSelectedCall(this.state.calls[index].id)} />
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

  callGeneratorForm() {
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

  callForm(callId) {
    let calls = this.state.calls;
    let call = calls.filter((element) => element.id === callId)[0]

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
            call['name'] = e.target.value
            this.setState({calls: calls})}} /> <br />
        <TextField
          hintText="Max signups"
          floatingLabelText="Max signups"
          value={call.maxSignups}
          onChange={(e) => {
            call['maxSignups'] = e.target.value
            this.setState({calls: calls})}} />
        <DatePicker
          floatingLabelText="Scheduled date"
          hintText="Scheduled date"
          mode="landscape"
          value={moment(call.scheduledTime).startOf('day').toDate()}
          autoOk={true}
          onChange={(nil, date) => {            ;
            let newMoment = moment(date);
            call['scheduledTime'] = moment({
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
            onChange={(nil, time) => {              ;
              let newMoment = moment(time);
              call['scheduledTime'] = moment({
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
    if (this.state.selectedCall !== null) {
      inputZDepth = 1;
      callForm = this.callForm(this.state.selectedCall)
    }
    else {
      inputZDepth = 0;
      callForm = this.callGeneratorForm()
    }

    let errorSnack = <div></div>
    let messageSnack = <div></div>
    if (this.state.globalErrorMessage)
      errorSnack = <Snackbar
        message={this.state.globalErrorMessage}
        autoHideDuration={10000}
        openOnMount={true}
        style={{'backgroundColor' : BernieColors.red}}
        action={null} />
    else if (this.state.globalStatusMessage)
      messageSnack = <Snackbar
        message={this.state.globalStatusMessage}
        autoHideDuration={10000}
        openOnMount={true}
        style={{'backgroundColor' : BernieColors.blue}}
        action={null} />

    return (
      <Paper zDepth={0} style={this.styles.container}>
        {errorSnack}
        {messageSnack}
        <Paper zDepth={inputZDepth} style={this.styles.callForm}>
          {callForm}
        </Paper>
        <Paper zDepth={0} style={this.styles.callList}>
          {this.generatedCallsList()}
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