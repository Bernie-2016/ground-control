import React from 'react';
import {Paper} from 'material-ui';
import {BernieText, BernieColors} from './styles/bernie-css';
import GCForm from './forms/GCForm';
import Form from 'react-formal';
import yup from 'yup';

export default class Signup extends React.Component {
  static FormStates = {
    enterEmail: {
      formTitle: 'Enter your e-mail to get started!',
      formSchema: yup.object({
        email: yup.string(),
      }),
      formElement: (
        <Form.Field
          name='email'
          label='E-mail Address'
        />
      )
    },
    newAccount: {
      formTitle: 'Sign up to Volunteer',
      formSchema: yup.object({
        firstName: yup.string().required(),
        lastName: yup.string().required(),
        zip: yup.string().required()
      }),
      formElement: (
        <div>
          <Form.Field
            name='firstName'
            label='First Name'
          /><br />
          <Form.Field
            name='lastName'
            label='Last Name'
          /><br />
          <Form.Field
            name='zip'
            label='Zip Code'
          />
        </div>
      )
    },
    enterPassword: {
      formTitle: 'Set a password to get started',
      formSchema: yup.object({
        password: yup.string().required()
      }),
      formElement: (
        <Form.Field
          name='password'
          label='Password'
        />
      )
    },
    login: {
      formTitle: 'Login to get started',
      formSchema: yup.object({
        password: yup.string().required()
      }),
      formElement: (
        <Form.Field
          name='password'
          label='Password'
        />
      )
    }
  }

  styles = {
    container: {
      width: '100%',
      backgroundColor: BernieColors.blue,
      color: BernieColors.white,
      padding: '15px 15px 15px 15px'
    }
  }

  state = {
    signupState: 'enterEmail'
  }

  render() {
    let formElement = Signup.FormStates[this.state.signupState].formElement;
    let formTitle = Signup.FormStates[this.state.signupState].formTitle;
    let formSchema = Signup.FormStates[this.state.signupState].formSchema;

    return (
      <Paper style={this.styles.container}>
        <div style={
          {
            ...BernieText.title,
            color: BernieColors.white,
            fontSize: '1.5em'
          }}>
          <GCForm
            schema={formSchema}
          >
            {formTitle}
            <Paper zDepth={0} style={{
              padding: '15px 15px 15px 15px',
              marginTop: 15,
              marginBottom: 15
            }}>
              {formElement}
            </Paper>
              <Form.Button
                type='submit'
                label='Go!'
                fullWidth={true}
              />
          </GCForm>
        </div>
      </Paper>
    )
  }
}