import React from 'react';
import {FontIcon, RaisedButton} from 'material-ui';

export default class PlivoDialer extends React.Component {
  static propTypes = {
    endpointUsername: React.PropTypes.string,
    endpointPassword: React.PropTypes.string,
    number: React.PropTypes.string
  }

  state = {
    plivoStatusText: null,
    plivoCallInProgress: false
  }

  registerCallbacks() {
    Plivo.onWebrtcNotSupported = () => {
      this.setState({plivoStatusText: 'Calling from this browser is not supported.'})
    }
    Plivo.onReady = () => { this.setState({plivoStatusText: 'Ready to call.'}) }
    Plivo.onLogin = () => { this.setState({plivoStatusText: 'Ready to call.'}) }
    Plivo.onLoginFailed = () => {
      this.setState({plivoStatusText: 'Dialing unavailable right now. Ask the tech team for help.'})
    }
    Plivo.onCalling = () => { this.setState({plivoStatusText: 'Calling...'}) }
    Plivo.onCallRemoteRinging = () => { this.setState({plivoStatusText: 'Ringing...'}) }
    Plivo.onCallAnswered = () => {
      this.setState({plivoStatusText: 'Call answered and in progress...'})
      this.setState({plivoCallInProgress: true})
    }
    Plivo.onCallFailed = () => { this.setState({plivoStatusText: 'Call failed.'})}
  }

  readyConnection() {
    Plivo.init()
    Plivo.conn.login(this.props.endpointUsername, this.props.endpointPassword)
  }

  componentDidMount() {
    this.registerCallbacks()
    this.readyConnection()
  }

  callPhone(number) {
    this.setState({plivoStatusText: 'calling '})
    // Plivo.conn.call(number)
    Plivo.conn.call('browsercheck150514110205')
  }

  hangupPhone() {
    Plivo.conn.hangup()
    this.setState({
      plivoStatusText: 'Call ended. Ready to call.',
      plivoCallInProgress: false
    })
  }

  styles = {
    buttonIcon: {
      color: 'white',
      height: '100%',
      lineHeight: '36px',
      padding: '0 0 4px 8px',
      verticalAlign: 'middle'
    },
    buttonLabel: {
      fontSize: '16px',
      verticalAlign: 'middle'
    },
    statusText: {
      color: 'rgb(54, 67, 80)',
      fontSize: '1rem',
      fontWeight: 'normal'
    }
  }

  render() {
    let plivoCallInProgress = this.state.plivoCallInProgress;
    let plivoStatusText = this.state.plivoStatusText;

    return (
      <div>
        <RaisedButton label="Call" labelPosition="after" primary={true}
          onTouchTap={this.callPhone.bind(this, this.props.number)}
          labelStyle={this.styles.buttonLabel}>
          <FontIcon className="material-icons" style={this.styles.buttonIcon}>
            call
          </FontIcon>
        </RaisedButton>
        <RaisedButton label="Hang up" labelPosition="after" secondary={true}
          onTouchTap={this.hangupPhone.bind(this)}
          style={plivoCallInProgress ? {visibility: null} : {visibility: 'hidden'}}
          labelStyle={this.styles.buttonLabel}>
          <FontIcon className="material-icons" style={this.styles.buttonIcon}>
            call_end
          </FontIcon>
        </RaisedButton>
        <div style={this.styles.statusText}>{plivoStatusText}</div>
      </div>
    )
  }
}
