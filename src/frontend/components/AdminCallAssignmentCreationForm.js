import React from 'react';
import Relay from 'react-relay';
import {BernieColors, BernieText} from './styles/bernie-css'
import {Paper} from 'material-ui';
import GCForm from './forms/GCForm';
import Form from 'react-formal';
import CreateCallAssignment from '../mutations/CreateCallAssignment';
import yup from 'yup';

export default class AdminCallAssignmentCreationForm extends React.Component {
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
    surveyId: yup.string().required(),
    callerGroupId: yup.string().required(),
    targetGroupId: yup.string().required(),
    name: yup.string().required(),
//    startDate: yup.date().required(),
//    endDate: yup.date()
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
      <div>
        Create a new phonebanking assignment. Before you fill out this form, make sure you've set up the correct objects in BSD.
      </div>
      <Paper zDepth={0} style={this.styles.formContainer}>
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
              console.log(error);
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
            label='Survey ID'
          /><br />
          <Form.Field
            name='callerGroupId'
            label='Caller Group'
          /><br />
          <Form.Field
            name='targetGroupId'
            label='Target Group'
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
