import React from 'react'
import Relay from 'react-relay'
import {BernieColors, BernieText} from './styles/bernie-css'
import {Paper} from 'material-ui'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import ChangeUserPassword from '../mutations/ChangeUserPassword'
import yup from 'yup'
import MutationHandler from './MutationHandler'

export default class UserAccountChangePasswordForm extends React.Component {
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
    currentPassword: yup.string().required(),
    newPassword: yup.string().required().min(8),
    confirmNewPassword: yup.string().test('match', 'Passwords do not match',
      function (confirmPass) { //Can't be an arrow-function due to `this`
        let {newPassword} = this.parent
        return newPassword == null || newPassword === confirmPass
      })
  })

  render() {
    return (
      <div style={BernieText.default}>
        <MutationHandler ref='mutationHandler' successMessage='Password changed!'
                         mutationClass={ChangeUserPassword} mutationName='changeUserPassword' />
        <div style={BernieText.secondaryTitle}>
          Change Password
        </div>
        <Paper zDepth={1} style={this.styles.formContainer}>
          <GCForm
            schema={this.formSchema}
            onSubmit={(formValue) => {
              this.refs.mutationHandler.send({
                ...formValue
              })
            }}
          >
            <Form.Field
              type='password'
              name='currentPassword'
              label='Current password'
              fullWidth={true}
            />
            <br />
            <Form.Field
              type='password'
              name='newPassword'
              label='New password'
              fullWidth={true}
            />
            <br />
            <Form.Field
              type='password'
              name='confirmNewPassword'
              label='Confirm password'
              fullWidth={true}
            />
            <br /> <br />

            <Form.Button
              type='submit'
              label='Change password'
              fullWidth={true}
            />
          </GCForm>
        </Paper>
      </div>
    )
  }
}