import React from 'react';
import Relay from 'react-relay';
import {BernieText, BernieColors} from './styles/bernie-css';
import {Paper, List, ListItem, FlatButton} from 'material-ui';
import SideBarLayout from './SideBarLayout';
import Survey from './Survey'
import moment from 'moment';
import yup from 'yup'
import GCForm from './forms/GCForm';
import Form from 'react-formal';

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

  state = {
    completed: true,
    reasonNotCompleted: 'NO_PICKUP',
    leftVoicemail: null
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

  formSchema = yup.object({
    completed: yup.boolean().required(),
    reasonNotCompleted: yup.string().oneOf(Object.keys(this.notCompletedReasons)).nullable(),
    leftVoicemail: yup.boolean().nullable()
  }).test('not-completed-reasons-required',
  'If you did not complete the call, please fill out why and if you left a voicemail',
    (value) => {
      if (value.completed)
        return true
      else
        return value.reasonNotCompleted !== null && value.leftVoicemail !== null
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

  formatPhoneNumber(number) {
    return '(' + number.slice(0, 3) + ') ' + number.slice(3, 6) + '-' + number.slice(7)
  }

  renderIntervieweeInfo() {
    let interviewee = this.props.currentUser.intervieweeForCallAssignment;
    let name = this.intervieweeName();
    let number = this.formatPhoneNumber(interviewee.phone)

    let sideBar = (
      <div style={{
        ...BernieText.default,
        color: BernieColors.blue,
        fontSize: '1.5em',
        fontWeight: 600
      }}>
        {name}
        <br />
        {number}
      </div>
    )

    let location = interviewee.address.city + ', ' + interviewee.address.state + ' ' + interviewee.address.zip

    console.log(interviewee.address.currentTime)
    let content = (
      <div style={BernieText.default}>
        Location: {location}<br />
        Local Time: {interviewee.address.currentTime}<br />
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
    let submitHandler = (formValue) => {
      if (this.state.completed)
        this.refs.survey.refs.component.submit()
    }

    let survey = (
      <div style={{
        ...this.styles.surveyFrame,
        display: this.state.completed ? 'block' : 'none'
      }}>
        <Survey ref='survey' survey={this.props.callAssignment.survey} initialValues={{'email' : this.props.currentUser.intervieweeForCallAssignment.email}} />
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
        </div>
      )
    submitHandler = submitHandler.bind(this)
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
            onSubmit={submitHandler}
            value={this.state}
            onChange={(formValue) => {
              this.setState(formValue)
            }}
            onError={(errors) => {
              // Implement
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
              <Form.Button type='submit' label='Submit and on to the person!' fullWidth={true} style={this.styles.submitButton}/>
            </div>
          </GCForm>
        </div>
      </div>
    );
  }
}

export default Relay.createContainer(CallAssignment, {
  initialVariables: { id: null },
  fragments: {
    callAssignment: () => Relay.QL`
      fragment on CallAssignment {
        id
        name
        survey {
          ${Survey.getFragment('survey')}
        }
      }
    `,
    currentUser: () => Relay.QL`
      fragment on User {
        id
        intervieweeForCallAssignment(callAssignmentId:$id) {
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
            currentTime
          }
        }
      }
    `
  }
});