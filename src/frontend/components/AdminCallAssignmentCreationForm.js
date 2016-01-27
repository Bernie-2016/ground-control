import React from 'react'
import Relay from 'react-relay'
import {BernieColors, BernieText} from './styles/bernie-css'
import {Paper} from 'material-ui'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import CreateCallAssignment from '../mutations/CreateCallAssignment'
import yup from 'yup'
import MutationHandler from './MutationHandler'

export default class AdminCallAssignmentCreationForm extends React.Component {
  surveyProcessors = {
    'bsd-event-rsvper': 'Create event RSVPs.'
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
    instructions: yup.string(),
    processors: yup.array().of(yup.string()).required()
  })

  render() {
    return (
      <div>
        <MutationHandler ref='mutationHandler' successMessage='Call assignment created!' mutationClass={CreateCallAssignment} />
        <div style={BernieText.title}>
          Create Assignment
        </div>
        <div style={BernieText.default}>
          Create a new phonebanking assignment. Before you fill out this form, you will need to do the following:
          <div style={{marginTop: 10}}>
            <ol>
              <li>Create a signup form in BSD using the 'GROUND CONTROL - Survey' wrapper</li>
              <li>Create a constituent group in BSD (or prepare a SQL query) that defines your target group of callees</li>
            </ol>
          </div>
          <div style={{marginTop: 10}}>
            If you select 'Create event RSVPs' under 'Post-submit survey processors', submissions of your survey in Ground Control will result in RSVPs being created. To use this, you must have a field in your survey that has a label that starts with [event_id] whose value is the ID of the event you want to create RSVPs for.
          </div>
        </div>
        <Paper zDepth={1} style={this.styles.formContainer}>
          <GCForm
            schema={this.formSchema}
            onSubmit={(formValue) => {
              formValue['renderer'] = 'BSDSurvey'
              formValue['processors'] = []

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
              hintText="(Optional) Enter instructions for this call assignment."
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
              hintText="Enter a SQL query, BSD cons_group_id, or the word 'everyone' to target everyone (the last is not recommended)."
            /><br />
            <br />
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
  }
});
