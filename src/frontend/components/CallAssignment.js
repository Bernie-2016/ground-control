import React from 'react';
import Relay from 'react-relay';
import {BernieText, BernieColors} from './styles/bernie-css';
import {Paper, List, ListItem, FlatButton} from 'material-ui';
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
      marginBottom: 15,
      marginRight: 15,
      marginLeft: 15,
      paddingTop: 15,
      paddingLeft: 15,
      paddingRight: 15,
      paddingBottom: 15,
      color: BernieColors.darkGray,
      fontSize: '1em',
      width: 'auto'
    },
    callAssignmentQuestions: {
      fontSize: '1.2em',
      textAlign: 'center',
      marginBottom: 15,
    },
    surveyFrame: {
      borderTop: 'solid 1px ' + BernieColors.lightGray,
    },
    questions: {
      paddingTop: 15,
    },
    container: {

    },
    submitButton: {
      textAlign: 'center',
      width: '50%',
      marginRight: 'auto',
      marginLeft: 'auto',
    }
  }

  state = {
    contacted: true,
    reasonNotContacted: null,
    leftVoicemail: null
  }

  formSchema = yup.object({
    contacted: yup.boolean().required(),
    reasonNotContacted: yup.string().oneOf(['NO_PICKUP', 'DECEASED', 'OTHER_LANGUAGE', 'CALL_BACK', 'NOT_INTERESTED', 'WRONG_NUMBER', 'BAD_NUMBER']),
    leftVoicemail: yup.boolean()
  })

  renderCalleeInfo() {
//    let callee = this.props.callAssignment.targetForUser
    let callee = {
      firstName: 'Saikat',
      lastName: 'Chakrabarti'
    }
    let name = callee.firstName + ' ' + callee.lastName
    return (
      <div>
        <div style={BernieText.secondaryTitle}>
          {name} - 817-999-4303<br />
        </div>
        <div style={BernieText.default}>
          Email: filler@filler.com<br />
          Location: New York, NY 10014<br />
          Local Time: 4:00 PM<br />
        </div>
      </div>
    )
  }

  render() {
    let submitHandler = (formValue) => {
      this.refs.survey.refs.component.submit()
    }
    let survey = (
      <div style={{
        ...this.styles.surveyFrame,
        display: this.state.contacted ? 'block' : 'none'
      }}>
        <Survey ref='survey' survey={this.props.callAssignment.survey} initialValues={{'email' : 'saikat@gomockingbird.com'}} />
      </div>
    )

    let notContactedQuestions = <div></div>
    if (!this.state.contacted)
      notContactedQuestions = (
        <div>
          <br />
          <Form.Field
            name='reasonNotContacted'
            label='Why not?' />
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
          <span>{this.renderCalleeInfo()}</span>
        </Paper>
        <div style={this.styles.questions}>
          <GCForm
            schema={this.formSchema}
            onSubmit={submitHandler}
            value={{
              contacted: this.state.contacted,
              leftVoicemail: this.state.leftVoicemail,
              reasonNotContacted: this.state.reasonNotContacted
            }}
          >
            <div style={this.styles.callAssignmentQuestions}>
              <Form.Field
                name='contacted'
                label='Were you able to talk to the person?'
                onChange={(val) => {
                  this.setState({contacted: val})
                }}
              />
              {notContactedQuestions}
            </div>
            {survey}
            <div style={this.styles.submitButton}>
              <Form.Button type='submit' label='Submit and on to the next volunteer!' fullWidth={true} style={this.styles.submitButton}/>
            </div>
          </GCForm>
        </div>
      </div>
    );
  }
}

export default Relay.createContainer(CallAssignment, {
  fragments: {
    callAssignment: () => Relay.QL`
      fragment on CallAssignment {
        id
        name
        survey {
          ${Survey.getFragment('survey')}
        }
      }
    `
  }
});