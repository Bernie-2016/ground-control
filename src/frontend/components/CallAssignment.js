import React from 'react';
import Relay from 'react-relay';
import {BernieText, BernieColors} from './styles/bernie-css';
import {Paper, List, ListItem, FlatButton, RaisedButton} from 'material-ui';
import SideBarLayout from './SideBarLayout';
import SurveyRenderer from './SurveyRenderer';
import moment from 'moment';
import yup from 'yup'
import GCForm from './forms/GCForm';
import Form from 'react-formal';
import SubmitCallSurvey from '../mutations/SubmitCallSurvey'

export class CallAssignment extends React.Component {
  styles = {
    assignmentBar: {
      backgroundColor: BernieColors.lightGray,
      marginTop: 15,
      marginLeft: 'auto',
      marginRight: 'auto',
      marginBottom: 15,
      paddingTop: 15,
      paddingLeft: 15,
      paddingRight: 15,
      paddingBottom: 15,
      color: BernieColors.darkGray,
      fontSize: '1em',
      width: 'auto',
      maxWidth: 720
    },
    callAssignmentQuestions: {
      fontSize: '1em',
      marginBottom: 15,
    },
    surveyFrame: {
      borderTop: 'solid 1px ' + BernieColors.lightGray,
    },
    questions: {
      paddingTop: 15,
      maxWidth: 720,
      marginLeft: 'auto',
      marginRight: 'auto'
    },
    submitButton: {

    }
  }

  clearState() {
    this.setState({
      globalErrorMessage: null,
    })
  }

  state = {
    completed: true,
    reasonNotCompleted: null,
    sentText: null,
    leftVoicemail: null,
    globalErrorMessage: null,
    plivoStatusText: null,
    plivoCallInProgress: false,
  }

  notCompletedReasons =
  {
    'NO_PICKUP' : 'Did not pick up',
    'CALL_BACK' : 'Busy/call back later',
    'NOT_INTERESTED' : 'Not interested in talking',
    'OTHER_LANGUAGE' : 'Spoke different language',
    'WRONG_NUMBER' : 'Wrong number',
    'DISCONNECTED_NUMBER' : 'Disconnected number'
  }

  formSchema = yup
    .object({
      completed: yup
        .boolean()
        .required(),
      reasonNotCompleted: yup
        .string()
        .nullable()
        .test(
          'not-completed-reasons-required',
          'Fill out why you were unable to complete the call',
          function(value) {
            if (this.parent.completed)
              return true;
            else
              return value !== null
          }
        ),
      leftVoicemail: yup
        .boolean()
        .nullable()
        .test(
          'left-voicemail-required',
          'Let us know if you left a voicemail',
          function(value) {
            if (this.parent.completed)
              return true
            else
              return value !== null
          }
        ),
      sentText: yup
        .boolean()
        .nullable()
        .test(
          'sent-text-required',
          'Let us know if you sent a text',
          function(value) {
            if (this.parent.completed)
              return true
            else
              return value !== null
          }
        )
    })

  plivoSetup() {
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
    Plivo.onCallEnded = () => {

    }
    Plivo.onMediaPermission = () => { alert('To make calls you must give your browser permission to use the microphone.') }

    Plivo.init();
    Plivo.conn.login('bernie151217012337', 'forthewin');
  }

  intervieweeName() {
    let interviewee = this.props.currentUser.intervieweeForCallAssignment;
    let name = ''
    let keys = ['prefix', 'firstName', 'middleName', 'lastName', 'suffix']
    keys.forEach((key) => {
      if (interviewee[key])
        name = name + ' ' + interviewee[key]
    })
    name = name.trim();
    return name === '' ? 'Unknown name' : name
  }

  formatPhoneNumber(number) {
    return '(' + number.slice(0, 3) + ') ' + number.slice(3, 6) + '-' + number.slice(6)
  }

  callPhone(number) {
    this.setState({plivoStatusText: 'calling '})
    // Plivo.conn.call(number)
    Plivo.conn.call('browsercheck150514110205');
  }

  hangupPhone() {
    Plivo.conn.hangup()
    this.setState({
      plivoStatusText: 'Call ended. Ready to call.',
      plivoCallInProgress: false
    })
  }

  renderIntervieweeInfo() {
    let interviewee = this.props.currentUser.intervieweeForCallAssignment
    let name = this.intervieweeName()
    let formattedNumber = this.formatPhoneNumber(interviewee.phone)
    let plivoStatusText = this.state.plivoStatusText;
    let plivoCallInProgress = this.state.plivoCallInProgress;

    let sideBar = (
      <div>
        <div style={{
          ...BernieText.default,
          color: BernieColors.blue,
          fontSize: '1.5em',
          fontWeight: 600
        }}>
          {name}
          <br />
          <a href={`tel:+1${interviewee.phone}`}
             style={{color: BernieColors.blue,
                     textDecoration: 'none'}}>
            {formattedNumber}
          </a>
        </div>
        <RaisedButton label="Call" primary={true} onTouchTap={this.callPhone.bind(this, '12028413640')} />
      <RaisedButton label="Hang up"
        onTouchTap={this.hangupPhone.bind(this)}
        style={plivoCallInProgress ? {visibility: null} : {visibility: 'hidden'}} />
        <div id="plivo-status">{plivoStatusText}</div>
      </div>
    )

    let location = interviewee.address.city + ', ' + interviewee.address.state + ' ' + interviewee.address.zip

    let content = (
      <div style={BernieText.default}>
        Location: {location}<br />
        Local Time: {moment().utcOffset(interviewee.address.localTime).format('h:mm a')}<br />
      </div>
    )

    return (
      <SideBarLayout
        content={content}
        sideBar={sideBar}
        sideBarStyle={{
          width: 300,
        }}
        contentViewStyle={{
          marginLeft: 50,
        }}
      />
    )
  }

  submitCallSurvey(surveyFields) {
    this.clearState();
    let onSuccess = () => {
     window.location.reload()
    }

    let onFailure = (transaction) => {
      this.clearState();
      this.setState({globalErrorMessage: 'Something went wrong trying to submit your survey. Try again in a bit.'})
      log.error(transaction.getError());
    }

    let callSurveyMutation = new SubmitCallSurvey({
      currentUser: this.props.currentUser,
      completed: this.state.completed,
      callAssignmentId: this.props.callAssignment.id,
      intervieweeId: this.props.currentUser.intervieweeForCallAssignment.id,
      leftVoicemail: this.state.leftVoicemail,
      sentText: this.state.sentText,
      reasonNotCompleted: this.state.reasonNotCompleted,
      sentText: this.state.sentText,
      surveyFieldValues: JSON.stringify(surveyFields)
    });
    Relay.Store.update(callSurveyMutation, {onFailure, onSuccess})
      ;
  }

  submitHandler(formValue) {
    if (this.state.completed)
      this.refs.survey.refs.component.submit()
    else
      this.submitCallSurvey({});
  }

  componentDidMount() {
    this.plivoSetup();
  }

  render() {
    if (this.props.currentUser.intervieweeForCallAssignment === null)
      return (
        <div style={{
          marginTop: 40,
          marginLeft: 40
        }}>
          <div style={BernieText.title}>
            All done!
          </div>
          <div style={BernieText.default}>
            We have no one left for you to call right now, but try again tomorrow.
          </div>
        </div>
      )

    let survey = (
      <div style={{
        ...this.styles.surveyFrame,
        display: this.state.completed ? 'block' : 'none'
      }}>
        <SurveyRenderer
          ref='survey'
          survey={this.props.callAssignment.survey}
          interviewee={this.props.currentUser.intervieweeForCallAssignment}
          onSubmitted={(surveyFields) => this.submitCallSurvey(surveyFields)} />
      </div>
    )

    let notCompletedQuestions = <div></div>
    if (!this.state.completed)
      notCompletedQuestions = (
        <div>
          <br />
          <Form.Field
            name='reasonNotCompleted'
            type='select'
            choices={this.notCompletedReasons}
            label='Why not?'
            />
          <br />
          <Form.Field
            name='leftVoicemail'
            label='Did you leave a voicemail?'
          />
          <br />
          <Form.Field
            name='sentText'
            label='Did you send a text message?'
          />
        </div>
      )
    return (
      <div style={this.styles.container}>
        <Paper
          style={this.styles.assignmentBar}
        >
          <span>{this.renderIntervieweeInfo()}</span>
        </Paper>
        <div style={this.styles.questions}>
          <GCForm
            schema={this.formSchema}
            globalError={this.state.globalErrorMessage}
            onSubmit={() => this.submitHandler()}
            value={this.state}
            onChange={(formValue) => {
              this.setState(formValue)
            }}
          >
            <div style={this.styles.callAssignmentQuestions}>
              <Form.Field
                name='completed'
                label='Were you able to complete the call?'
              />
              {notCompletedQuestions}
            </div>
            {survey}
            <div style={this.styles.submitButton}>
              <Form.Button type='submit' label='Submit and on to the next person!' fullWidth={true} style={this.styles.submitButton}/>
            </div>
          </GCForm>
        </div>
      </div>
    );
  }
}

export default Relay.createContainer(CallAssignment, {
  initialVariables: { id: '' },
  fragments: {
    callAssignment: () => Relay.QL`
      fragment on CallAssignment {
        id
        name
        survey {
          ${SurveyRenderer.getFragment('survey')}
        }
      }
    `,
    currentUser: () => Relay.QL`
      fragment on User {
        id
        intervieweeForCallAssignment(callAssignmentId:$id) {
          id
          prefix
          firstName
          middleName
          lastName
          suffix
          gender
          birthDate
          title
          employer
          occupation
          phone
          email
          address {
            city
            state
            zip
            localTime
            latitude
            longitude
          }
          ${SurveyRenderer.getFragment('interviewee')}
        }
      }
    `
  }
});
