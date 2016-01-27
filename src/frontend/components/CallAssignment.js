import React from 'react';
import Relay from 'react-relay';
import {BernieText, BernieColors} from './styles/bernie-css';
import {Paper, List, ListItem, RaisedButton} from 'material-ui';
import SideBarLayout from './SideBarLayout';
import moment from 'moment';
import yup from 'yup'
import GCForm from './forms/GCForm';
import Form from 'react-formal';
import SubmitCallSurvey from '../mutations/SubmitCallSurvey'
import CallStatsBar from './CallStatsBar'
import MutationHandler from './MutationHandler';

const SurveyRenderers = {
  'BSDSurvey': require('./survey-renderers/BSDSurvey'),
  'PhonebankRSVPSurvey': require('./survey-renderers/PhonebankRSVPSurvey'),
  'SingleEventRSVPSurvey': require('./survey-renderers/SingleEventRSVPSurvey'),
  'Jan23HostRecruitmentSurvey': require('./survey-renderers/Jan23HostRecruitmentSurvey')
}

class CallAssignment extends React.Component {
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
      paddingTop: 30
    },
    questions: {
      paddingTop: 15,
      maxWidth: 720,
      marginLeft: 'auto',
      marginRight: 'auto'
    },
    instructions: {
      marginLeft: 'auto',
      marginRight: 'auto',
      border: 'solid 1px ' + BernieColors.blue,
      maxWidth: 720,
      marginTop: 15,
      marginBottom: 50,
      padding: '15px 15px 15px 15px'
    },
    submitButton: {
      marginTop: 20,
      marginBottom: 20
    }
  }

  state = {
    completed: true,
    reasonNotCompleted: null,
    sentText: null,
    leftVoicemail: null,
    showInstructions: true
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

  generateEventsInfoEmailLink() {
    const userFirstName = this.props.currentUser.firstName;
    const interviewee = this.props.currentUser.intervieweeForCallAssignment;
    const name = (interviewee.firstName) ? interviewee.firstName : this.intervieweeName();
    const email = interviewee.email;
    const zip = interviewee.address.zip;
    const subject = escape('Bernie Phone Call Followup');
    const message = escape(
`Hi ${name},

You asked me for more information about upcoming events in your area. You can view and RSVP to campaign events here:
http://map.berniesanders.com/#zipcode=${zip}&distance=50

We really appreciate your time! If you're interested in getting involved further, please feel free to sign up at https://berniesanders.com/phonebank.

Thanks,
${userFirstName}`
    );

    return `mailto:${email}?subject=${subject}&body=${message}`
  }


  formatPhoneNumber(number) {
    let sliceStart = 1

    return '(' + number.slice(sliceStart, sliceStart + 3) + ') ' + number.slice(sliceStart + 3, sliceStart + 6) + '-' + number.slice(sliceStart + 6)
  }

  renderIntervieweeInfo() {
    let interviewee = this.props.currentUser.intervieweeForCallAssignment
    let name = this.intervieweeName()
    let localTime = moment().utcOffset(interviewee.address.localUTCOffset).format('h:mm a')

    let lastCalled = () => {
      if (interviewee.lastCalled) {
        return moment(interviewee.lastCalled).utcOffset(interviewee.address.localUTCOffset).fromNow()
      } else {
        return 'never'
      }
    }
    let phoneNumber = interviewee.phone
    if (phoneNumber[0] !== '1')
      phoneNumber = '1' + phoneNumber

    phoneNumber = phoneNumber.slice(0, 11)
    let formattedNumber = this.formatPhoneNumber(phoneNumber)
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
          <a style={{color: BernieColors.darkBlue}} href={`tel:+${phoneNumber}`}>
            {formattedNumber}
          </a>
        </div>
      </div>
    )

    let location = interviewee.address.city + ', ' + interviewee.address.state + ' ' + interviewee.address.zip
    let email =  this.props.currentUser.intervieweeForCallAssignment.email ? <a target='_blank' href={this.generateEventsInfoEmailLink()}>{this.props.currentUser.intervieweeForCallAssignment.email}</a> : 'None'
    let content = (
      <div style={BernieText.default}>
        Location: {location}<br />
        Local Time: {localTime}<br />
        Last called: {lastCalled()}<br />
        Email: {email}
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
    this.refs.mutationHandler.send({
      currentUser: this.props.currentUser,
      completed: this.state.completed,
      callAssignmentId: this.props.callAssignment.id,
      intervieweeId: this.props.currentUser.intervieweeForCallAssignment.id,
      leftVoicemail: this.state.leftVoicemail,
      sentText: this.state.sentText,
      reasonNotCompleted: this.state.reasonNotCompleted,
      sentText: this.state.sentText,
      surveyFieldValues: JSON.stringify(surveyFields)
    })
  }

  submitHandler(formValue) {
    if (this.state.completed)
      this.refs.survey.refs.component.submit()
    else
      this.submitCallSurvey({});
  }

  renderInstructions() {
    if (this.state.showInstructions && this.props.callAssignment.instructions) {
      return (
        <Paper
            zDepth={0}
            style={this.styles.instructions}
          >
          <div>
            {this.props.callAssignment.instructions}
          </div>
          <RaisedButton
            style={{
              marginTop: 10
            }}
            label="Ok, I got it!"
            secondary={true}
            onTouchTap={(event) => {
              this.setState({showInstructions: false})
            }}
          />
        </Paper>
      )
    } else {
      return <div></div>
    }
  }

  render() {
    let endDate = this.props.callAssignment.endDate

    if (endDate !== null && moment(endDate).isBefore(moment().add(1, 'days')))
      return (
        <div style={{
          marginTop: 40,
          marginLeft: 40
        }}>
          <div style={BernieText.default}>
            This call assignment is done!
          </div>
        </div>
      )
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

    let Survey = SurveyRenderers[this.props.callAssignment.renderer];

    let survey = (
      <div style={{
        ...this.styles.surveyFrame,
        display: this.state.completed ? 'block' : 'none'
      }}>
        <div style={{
            ...BernieText.title,
            fontSize: '1.8em',
            color: BernieColors.lightBlue
          }}>
          Call Script
        </div>
        <Survey
          ref='survey'
          callAssignment={this.props.callAssignment}
          survey={this.props.callAssignment.survey}
          interviewee={this.props.currentUser.intervieweeForCallAssignment}
          currentUser={this.props.currentUser}
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
      <div>
        <MutationHandler
          ref='mutationHandler'
          mutationClass={SubmitCallSurvey}
          defaultErrorMessage='Something went wrong trying to submit your survey. Try again in a bit.'
          onSuccess = {() => {
            window.location.reload()
          }}
          />
        <CallStatsBar callsMade={this.props.currentUser.allCallsMade} callsCompleted={this.props.currentUser.completedCallsMade} />
        <div style={this.styles.container}>
          {this.renderInstructions()}
          <Paper
            style={this.styles.assignmentBar}
          >
            <span>{this.renderIntervieweeInfo()}</span>
          </Paper>
          <div style={this.styles.questions}>
            <GCForm
              schema={this.formSchema}
              onSubmit={() => this.submitHandler()}
              value={this.state}
              onChange={(formValue) => {
                this.setState(formValue)
              }}
            >
              <div style={this.styles.callAssignmentQuestions}>
                <Form.Field
                  name='completed'
                  label='Did the person pick up and answer all your questions?'
                  labelStyle={{
                    ...BernieText.secondaryTitle,
                    fontWeight: 600,
                    color: BernieColors.blue,
                    fontSize: '1.2em',
                    letterSpacing: '0em'
                  }}
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
        endDate
        name
        instructions
        survey {
          ${SurveyRenderers.BSDSurvey.getFragment('survey')}
        }
        renderer
        ${SurveyRenderers.SingleEventRSVPSurvey.getFragment('callAssignment')}
      }
    `,
    currentUser: () => Relay.QL`
      fragment on User {
        id
        firstName
        allCallsMade:callsMade(forAssignmentId:$id)
        completedCallsMade:callsMade(forAssignmentId:$id,completed:true)
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
          lastCalled
          address {
            city
            state
            zip
            localUTCOffset
            latitude
            longitude
          }
          ${SurveyRenderers.Jan23HostRecruitmentSurvey.getFragment('interviewee')}
          ${SurveyRenderers.BSDSurvey.getFragment('interviewee')}
          ${SurveyRenderers.PhonebankRSVPSurvey.getFragment('interviewee')}
          ${SurveyRenderers.SingleEventRSVPSurvey.getFragment('interviewee')}
        }
        ${SurveyRenderers.PhonebankRSVPSurvey.getFragment('currentUser')}
        ${SurveyRenderers.BSDSurvey.getFragment('currentUser')}
        ${SurveyRenderers.SingleEventRSVPSurvey.getFragment('currentUser')}
        ${SurveyRenderers.Jan23HostRecruitmentSurvey.getFragment('currentUser')}
      }
    `
  }
});
