import React from 'react';
import Relay from 'react-relay';
import {BernieColors, BernieText} from './styles/bernie-css'
import {Paper} from 'material-ui';
import GCTextField from './forms/GCTextField';
import Form from 'react-formal';
import yup from 'yup';

Form.addInputTypes({
  string: GCTextField
})

export default class CallAssignmentCreationForm extends React.Component {

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
    BSDSurvey: yup.string().required(),
    callerGroup: yup.string().required(),
    targetGroup: yup.string().required(),
    name: yup.string().required(),
//    startDate: yup.date().required(),
//    endDate: yup.date()
  })

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
        <Form
          schema={this.formSchema}
          defaultValue={this.formSchema.default()}
        >
          <Form.Field
            name='name'
            label='Name'
          /><br />
          <Form.Field
            name='BSDSurvey'
            label='Survey ID'
          /><br />
          <Form.Field
            name='callerGroup'
            label='Caller Group (BSD cons_group ID)'
          /><br />
          <Form.Field
            name='targetGroup'
            label='Target Group (BSD cons_group ID)'
          /><br />
        </Form>
      </Paper>
      </div>
    )
  }
}
