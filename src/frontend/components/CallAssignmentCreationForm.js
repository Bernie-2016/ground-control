import React from 'react';
import Relay from 'react-relay';
import {BernieColors, BernieText} from './styles/bernie-css'
import {TextField, SvgIcon, DatePicker, Paper, List, FloatingActionButton, Styles, ListItem, ListDivider, TimePicker, RaisedButton, Snackbar} from 'material-ui';
import Form from 'react-formal';
import yup from 'yup';

export default class CallAssignmentCreationForm extends React.Component {

  styles = {
    container: {
      paddingLeft: 15,
      paddingRight: 15,
      paddingTop: 15,
      paddingBottom: 15,
      border: 'solid 1px ' + BernieColors.lightGray
    }
  }

  formSchema = yup.object({
    BSDSurvey: yup.string().required(),
    callerGroup: yup.string().required(),
    targetGroup: yup.string().required()
  })

  render() {
    return (
      <Paper zDepth={1} style={this.styles.container}>
        <Form
          schema={this.formSchema}
          defaultValue={this.formSchema.default()}
        >
          <Form.Field
            name='BSDSurvey'
            placeholder='BSD Survey ID'
          />
          <Form.Field
            name='callerGroup'
            placeholder='BSD Cons Group ID for callers'
          />
          <Form.Field
            name='targetGroup'
            placeholder='BSD Cons Group ID for target'
          />
        </Form>
      </Paper>
    )
  }
}
