import React from 'react';
import {BernieText, BernieColors} from './styles/bernie-css';
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
      console.log('PlivoJS says WebRTC not supported by browser, using tel link instead')
    }
    Plivo.onFlashNotInstalled = () => {
      this.setState({useTelLinkFallback: true})
      console.log('PlivoJS says Flash not supported by browser, using tel link instead')
    }
    Plivo.onReady = () => {
      console.log('PlivoJS is ready to be used')
      Plivo.conn.login(this.props.endpointUsername, this.props.endpointPassword)
    }
    Plivo.onMediaPermission = () => {
      console.log('PlivoJS found media access permissions have been granted')
    }
    Plivo.onLogin = () => {
      console.log('PlivoJS succesfully logged in')
    }
    Plivo.onLoginFailed = () => {
      this.setState({plivoStatusText: "Couldn't make the call. Let help@berniesanders.com know and dial the person manually."})
    }
    Plivo.onCalling = () => {
      this.setState({plivoCallInProgress: true})
      this.setState({plivoStatusText: null})
    }
    Plivo.onCallRemoteRinging = () => {
      console.log('PlivoJS call ringing')
    }
    Plivo.onCallAnswered = () => {
      console.log('PlivoJS call answered')
    }
    Plivo.onCallTerminated = () => {
      this.setState({plivoCallInProgress: false})
    }
    Plivo.onCallFailed = (cause) => {
      this.setState({plivoCallInProgress: false})
      this.setState({plivoStatusText: `Couldn't connect. ${cause}.`})
    }
  }

  componentDidMount() {
    this.registerCallbacks()
    Plivo.init({debug: true,
                fallback_to_flash: false})
  }

  callPhone(number) {
    if (this.state.useTelLinkFallback) {
      window.open(`tel:+1${number}`)
    } else {
      Plivo.conn.call(number)
    }
  }

  hangupPhone() {
    Plivo.conn.hangup()
  }

  formatPhoneNumber(number) {
    let sliceStart = 0;
    if (number.length === 11 && number[0] === '1')
      sliceStart = 1
    return '(' + number.slice(sliceStart, sliceStart + 3) + ') ' + number.slice(sliceStart + 3, sliceStart + 6) + '-' + number.slice(sliceStart + 6)
  }

  styles = {
    actionButton: {
      marginRight: '.75rem',
      verticalAlign: 'middle'
    },
    formattedNumberActive: {
      color: BernieColors.darkBlue,
      textShadow: '-1px 1px 4px rgb(20, 127, 215), 1px -1px 4px rgb(196, 223, 245)',
      transition: '250ms linear 0s'
    },
    statusText: {
      color: BernieColors.red,
      fontSize: '.8rem',
      fontWeight: 'bold',
      marginTop: '.5rem'
    }
  }

  render() {
    let formattedNumber = this.formatPhoneNumber(this.props.number)
    let plivoCallInProgress = this.state.plivoCallInProgress
    let plivoStatusText = this.state.plivoStatusText

    let icon = plivoCallInProgress ?
      <FontIcon className="material-icons">
        call_end
      </FontIcon>
      :
      <FontIcon className="material-icons">
        call
      </FontIcon>

    let touchAction = plivoCallInProgress ?
      this.hangupPhone.bind(this)
      : this.callPhone.bind(this, this.props.number)

    let backgroundColor = plivoCallInProgress ?
      BernieColors.red
      : BernieColors.green

    return (
      <div>
        <FloatingActionButton
          backgroundColor={backgroundColor}
          onTouchTap={touchAction}
          style={this.styles.actionButton}
          mini={true}
        >
          {icon}
        </FloatingActionButton>
        <span style={plivoCallInProgress ? this.styles.formattedNumberActive : null}>
          {formattedNumber}
        </span>
        <p style={this.styles.statusText}>
          {plivoStatusText}
        </p>
      </div>
    )
  }
}
