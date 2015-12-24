import React from 'react';
import {FloatingActionButton, FontIcon} from 'material-ui';

export default class PlivoDialer extends React.Component {
  static propTypes = {
    endpointUsername: React.PropTypes.string,
    endpointPassword: React.PropTypes.string,
    number: React.PropTypes.string
  }

  state = {
    plivoCallInProgress: false,
    plivoStatusText: null,
    useTelLinkFallback: false
  }

  registerCallbacks() {
    Plivo.onWebrtcNotSupported = () => {
      this.setState({useTelLinkFallback: true})
    }
    Plivo.onReady = () => {
      console.log('PlivoJS is ready to be used')
    }
    Plivo.onMediaPermission = () => {
      console.log('PlivoJS user media access permissions granted')
    }
    Plivo.onLogin = () => {
      this.setState({plivoStatusText: 'Ready to call.'})
    }
    Plivo.onLoginFailed = () => {
      this.setState({plivoStatusText: 'Calling unavailable right now. Ask the tech team for help.'})
    }
    Plivo.onCalling = () => {
      this.setState({plivoCallInProgress: true})
      this.setState({plivoStatusText: 'Calling...'})
    }
    Plivo.onCallRemoteRinging = () => {
      this.setState({plivoStatusText: 'Ringing...'})
    }
    Plivo.onCallAnswered = () => {
      this.setState({plivoStatusText: 'Call answered and in progress...'})
    }
    Plivo.onCallTerminated = () => {
      this.setState({plivoCallInProgress: false})
      this.setState({plivoStatusText: 'Call ended. Ready to call.'})
    }
    Plivo.onCallFailed = (cause) => {
      this.setState({plivoCallInProgress: false})
      this.setState({plivoStatusText: `Call failed: ${cause}`})
    }
  }

  readyConnection() {
    Plivo.init({debug: true});
    Plivo.conn.login(this.props.endpointUsername, this.props.endpointPassword);
  }

  componentDidMount() {
    this.registerCallbacks()
    this.readyConnection()
  }

  callPhone(number) {
    if (this.state.useTelLinkFallback) {
      window.location = `tel:+1${number}`
    } else {
      Plivo.conn.call(number)
    }
  }

  hangupPhone() {
    Plivo.conn.hangup()
  }

  styles = {
    statusText: {
      color: 'rgb(54, 67, 80)',
      fontSize: '1rem',
      fontWeight: 'normal'
    }
  }

  render() {
    let plivoCallInProgress = this.state.plivoCallInProgress;
    let plivoStatusText = this.state.plivoStatusText;
    let displayed = this.state.displayed;

    return (
      <div>
        <FloatingActionButton
          onTouchTap={this.callPhone.bind(this, this.props.number)}
          style={plivoCallInProgress ? {display: 'none'} : null}
        >
          <FontIcon className="material-icons">
            call
          </FontIcon>
        </FloatingActionButton>
        <FloatingActionButton secondary={true}
          onTouchTap={this.hangupPhone.bind(this)}
          style={plivoCallInProgress ? null : {display: 'none'}}
        >
          <FontIcon className="material-icons">
            call_end
          </FontIcon>
        </FloatingActionButton>
        <div style={this.styles.statusText}>{plivoStatusText}</div>
      </div>
    )
  }
}
