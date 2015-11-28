import React from 'react';
import {Paper, TextField} from 'material-ui';
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
        <TextField
          name='email'
          hintText='E-mail Address'
          type='email'
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
    signupForm: {
      width: '100%',
      backgroundColor: BernieColors.blue,
      color: BernieColors.white,
      padding: '15px 15px 15px 15px'
    },
    paragraph: {
      paddingTop: '0.5em',
      paddingBottom: '0.5em',
      paddingLeft: '0.5em',
      paddingRight: '0.5em',
    },
    introContainer: {
      display: 'flex',
      flexDirection: 'row'
    },
    introTextContainer: {
      flex: 1,
      marginRight: 40
    },
    signupFormContainer: {
      flex: 'auto',
      width: '12em'
    },
    container: {
      padding: 40,
      paddingTop: 40,
      paddingRight: 40,
      paddingBottom: 40,
    },
  }

  state = {
    signupState: 'enterEmail'
  }

  renderSplash() {
    return (
      <div style={this.styles.container} >
        <div style={this.styles.introContainer}>
          <div style={this.styles.introTextContainer}>
            <div style={{
              ...BernieText.secondaryTitle,
              display: 'block'
            }}>
              Make Calls
            </div>
            <div style={BernieText.title}>
              Let them hear you loud and clear
            </div>
            <div style={BernieText.default}>
              <p style={this.styles.paragraph}>
                Get riled up get riled up get riled up get riled up.
                </p>
                <p style={this.styles.paragraph}>
                  Are you riled yet?  Get riled up a bit more.
                </p>
                <p style={this.styles.paragraph}>
                  Ok calm down now.
                </p>
                <p style={this.styles.paragraph}>
                  Thanks for all you do,
                </p>
                <img src='https://s.bsd.net/bernie16/main/page/-/Email%20Images/sig-red.png' width='170' alt='Bernie' />
            </div>
          </div>
          <div styles={this.styles.signupFormContainer}>
            {this.renderSignupForm()}
          </div>
        </div>
      </div>
    )
  }

  renderSignupForm() {
    let formElement = Signup.FormStates[this.state.signupState].formElement;
    let formTitle = Signup.FormStates[this.state.signupState].formTitle;
    let formSchema = Signup.FormStates[this.state.signupState].formSchema;

    return (
      <Paper style={this.styles.signupForm}>
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

  render() {
    return this.renderSplash();
  }
}