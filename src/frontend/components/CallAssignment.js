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
      width: '100%',
      color: BernieColors.darkGray,
      fontSize: '1em',
      width: 'auto'
    },
    surveyFrame: {
      borderTop: 'solid 1px ' + BernieColors.lightGray,
    },
    questions: {
      paddingTop: 15,
    },
    container: {
      width: '100%'
    },
    submitButton: {
      width: '50%',
      marginRight: 'auto',
      marginLeft: 'auto',
    }
  }

  formSchema = yup.object({
    volunteerPickedUp: yup.boolean().required(),
    callCompleted: yup.boolean()
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
          >
            <div>
              <Form.Field
                name='volunteerPickedUp'
                label='Did the volunteer pick up?'
              /><br />
              <Form.Field
                name='callCompleted'
                label='Did you complete the call?'
              />
            </div>
            <div style={this.styles.surveyFrame}>
              <Survey ref='survey' survey={this.props.callAssignment.survey} initialValues={{'email' : 'saikat@gomockingbird.com'}} />
            </div>
            <div style={this.styles.submitButton}>
              <Form.Button type='submit' label='Submit and on to the next volunteer!' style={this.styles.submitButton} fullWidth={true}/>
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