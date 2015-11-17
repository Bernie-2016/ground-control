import React from 'react';
import Relay from 'react-relay';
import {BernieText, BernieColors} from './styles/bernie-css';
import {Paper, List, ListItem, FlatButton} from 'material-ui';
import Survey from './Survey'
import moment from 'moment';
import yup from 'yup'
import GCForm from './forms/GCForm';
import Form from 'react-formal';

export class CallAssignmentViewer extends React.Component {
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
      backgroundColor: BernieColors.green
    }
  }

  formSchema = yup.object({
    volunteerPickedUp: yup.boolean().required(),
    callCompleted: yup.boolean()
  })

  render() {
    return (
      <div style={this.styles.container}>
        <Paper
          style={{
          ...BernieText.secondaryTitle,
          ...this.styles.assignmentBar}}
        >
          <span>Saikat - 817-999-4303</span>
        </Paper>
        <div style={this.styles.questions}>
          <GCForm
            schema={this.formSchema}
            style={{width: '100%'}}
          >
            <Form.Field
              name='volunteerPickedUp'
              label='Did the volunteer pick up?'
            /><br />
            <Form.Field
              name='callCompleted'
              label='Did you complete the call?'
            />
            <div style={this.styles.surveyFrame}>
              <Survey survey={this.props.viewer.callAssignment.survey} />
            </div>
            <div style={this.styles.submitButton}>
              <Form.Button type='submit' label='Submit and onto the next volunteer!' style={this.styles.submitButton} fullWidth={true}/>
            </div>
          </GCForm>
        </div>
      </div>
    );
  }
}

export default Relay.createContainer(CallAssignmentViewer, {
  initialVariables: { id: null },

  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        callAssignment(id:$id) {
          id
          name
          survey {
            ${Survey.getFragment('survey')}
          }
        }
      }
    `
  }
});