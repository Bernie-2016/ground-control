import React from 'react';
import Relay from 'react-relay';
import {BernieColors, BernieText} from './styles/bernie-css'
import {Paper} from 'material-ui';
import GCForm from './forms/GCForm';
import Form from 'react-formal';
import CreateCallAssignment from '../mutations/CreateCallAssignment';
import yup from 'yup';

export default class AdminCallAssignmentCreationForm extends React.Component {
  surveyRenderers = {
    'BSDSurvey': 'Simple BSD survey renderer',
    'BSDPhonebankRSVPSurvey': 'BSD survey + events',
  }

  surveyProcessors = {
    'bsd-event-rsvper': 'Create event RSVPs'
  }

  styles = {
    formContainer: {
      width: 360,
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
    renderer: yup.string().required(),
    processors: yup.array().of(yup.string()).required()
  })

  state = {
    globalErrorMessage: null,
    globalStatusMessage: null
  }

  clearState() {
    this.setState({
      globalErrorMessage: null,
      globalStatusMessage: null
    })
  }

  render() {
    return (
      <div>
      <div style={BernieText.title}>
        Create Assignment
      </div>
      <div style={BernieText.default}>
        <p>Create a new phonebanking assignment.</p>
        <p>Before you fill out this form, make sure you've set up the correct objects in BSD.</p>
      </div>
      <Paper zDepth={1} style={this.styles.formContainer}>
        <GCForm
          schema={this.formSchema}
          globalError={this.state.globalErrorMessage}
          globalStatus={this.state.globalStatusMessage}
          onSubmit={(formValue) => {
            this.clearState();
            let onFailure = (transaction) => {
              this.clearState()

              let defaultMessage = 'Something went wrong.'
              let error = transaction.getError();
              let errorMessage = error.source ? error.source.errors[0].message : defaultMessage;
              try {
                errorMessage = JSON.parse(errorMessage)
                errorMessage = errorMessage.message;
              } catch(ex) {
                errorMessage = defaultMessage;
              }
              this.setState({globalErrorMessage: errorMessage})
            };

            let onSuccess = (transaction) => {
              this.clearState()
              this.setState({globalStatusMessage: 'Call assignment created successfully!'})
            };
            console.log(formValue)

            Relay.Store.update(
              new CreateCallAssignment({
                listContainer: this.props.listContainer,
                ...formValue
              }), {onFailure, onSuccess}
            );
          }}
        >
          <Form.Field
            name='name'
            label='Name'
          />
          <br />
          <Form.Field
            name='surveyId'
            label='BSD signup form ID'
          /><br />
          <Form.Field
            name='intervieweeGroup'
            multiLine={true}
            rows={5}
            label="Target group of interviewees.  Enter a SQL query, BSD cons_group_id, or the word 'everyone'"
          /><br />
          <Form.Field
            name='renderer'
            type='select'
            choices={this.surveyRenderers}
            label='How to render the survey?'
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
