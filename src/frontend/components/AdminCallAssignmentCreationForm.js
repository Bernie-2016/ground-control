import React from 'react';
import Relay from 'react-relay';
import {BernieColors, BernieText} from './styles/bernie-css'
import {Paper} from 'material-ui';
import GCForm from './forms/GCForm';
import Form from 'react-formal';
import CreateCallAssignment from '../mutations/CreateCallAssignment';
import yup from 'yup';
import MutationHandler from './MutationHandler';

export default class AdminCallAssignmentCreationForm extends React.Component {
  surveyRenderers =
  {
    'BSDSurvey' : 'Simple BSD survey renderer',
    'BSDPhonebankRSVPSurvey' : 'BSD survey + events',
  }

  surveyProcessors = {
    'bsd-event-rsvper' : 'Create event RSVPs'
  }

  styles = {
    formContainer: {
      width: 280,
      paddingLeft: 15,
      paddingRight: 15,
      paddingTop: 15,
      paddingBottom: 15,
      marginTop: 15,
      border: 'solid 1px ' + BernieColors.lightGray
    }
  }

  formSchema = yup.object({
    surveyId: yup.number().required(),
    intervieweeGroup: yup.string().required(),
    name: yup.string().required(),
    instructions: yup.string(),
    renderer: yup.string().required(),
    processors: yup.array().of(yup.string()).required()
  })

  render() {
    return (
      <div>
        <MutationHandler ref='mutationHandler' successMessage='Call assignment created!' mutationClass={CreateCallAssignment} />
        <div style={BernieText.title}>
          Create Assignment
        </div>
        <div>
          Create a new phonebanking assignment. Before you fill out this form, make sure you've set up the correct objects in BSD.
        </div>
        <Paper zDepth={0} style={this.styles.formContainer}>
          <GCForm
            schema={this.formSchema}
            onSubmit={(formValue) => {
              this.refs.mutationHandler.send({
                listContainer: this.props.listContainer,
                ...formValue
              })
            }}
          >
            <Form.Field
              name='name'
              label='Name'
            />
            <br />
            <Form.Field
              name='instructions'
              multiLine={true}
              rows={5}
              label="Instructions"
              hintText="(Optional) Enter HTML or plain text instructions for this call assignment."
            /><br />
            <Form.Field
              name='surveyId'
              label='BSD signup form ID'
            /><br />
            <Form.Field
              name='intervieweeGroup'
              multiLine={true}
              rows={5}
              label="Interviewee group"
              hintText="Enter a SQL query, BSD cons_group_id, or the word 'everyone'"
            /><br />
            <Form.Field
              name='renderer'
              type='select'
              choices={this.surveyRenderers}
              label='How to render the survey?'
              style={{
                width: '100%'
              }}
            /><br />
            <Form.Field
              name='processors'
              choices={this.surveyProcessors}
              label='Post-submit survey processors'
            /><br />

            <Form.Button type='submit' label='Create!' fullWidth={true} />
          </GCForm>
        </Paper>
      </div>
    )
  }
}

export default Relay.createContainer(AdminCallAssignmentCreationForm, {
  fragments: {
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        ${CreateCallAssignment.getFragment('listContainer')},
      }
    `
  },
});
