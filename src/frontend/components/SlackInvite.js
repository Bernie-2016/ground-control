import React from 'react'
import {Paper, TextField} from 'material-ui'
import {BernieText, BernieColors} from './styles/bernie-css';
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import yup from 'yup'
import superagent from 'superagent'
import {Styles} from 'material-ui'
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider'
import {BernieTheme} from './styles/bernie-theme'
import {slacks} from './data/slacks'

console.log(slacks)

export default class SlackInvite extends React.Component {
  state = {
    formState: 'signup',
    errorMessage: null,
  }

  clearError() {
    this.setState({ errorMessage: null })
  }

  redirectToNext() {
    this.props.history.push('/call')
  }

  formStates = {
    signup: {
      formTitle: 'Enter your email address:',
      formSchema: yup.object({
        email: yup.string().email().required(),
      }),
      formElement: (
        <div>
          <Form.Field
            name='email'
            label='E-mail Address'
            hintText='Email'
            type='email'
            floatingLabelText={false}
            fullWidth={true}
          />
          <br />
        </div>
      ),
      onSubmit: (formState) => {
        this.clearError()
        superagent
          .post('/slack-invites')
          .send({
              email: formState.email,
              slackTeam: this.props.routeParams.team
            })
          .end((err, res) => {
              console.log('woo')
              if (!err) {
                this.redirectToNext()
              } else {
                this.setState({errorMessage: 'Whoops! An error occurred. Please try again!'})
              }
            })
      }
    }
  }

  styles = {
    signupForm: {
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      backgroundColor: BernieColors.blue,
      color: BernieColors.white,
      padding: 15
    },
    container: {
      padding: '40px',
      textAlign: 'center'
    },
    errorMessage: {
      ...BernieText.default,
      color: BernieColors.lightRed,
      fontSize: '0.8em',
      marginTop: 15,
      textAlign: 'center'
    }
  }

  renderForm() {
    let state = this.formStates[this.state.formState];
    let formElement = state.formElement;
    let formTitle = state.formTitle;
    let formSchema = state.formSchema;
    let submitHandler = state.onSubmit;
    let errorElement = <div></div>;

    if (this.state.errorMessage) {
      errorElement = <div style={this.styles.errorMessage}>{this.state.errorMessage}</div>
    }

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
            onSubmit={(formData) => {
              submitHandler(formData)
            }}
          >
            {formTitle}
            {errorElement}
            <Paper zDepth={0} style={{
              padding: 15,
              marginTop: 15,
              marginBottom: 15
            }}>
              {formElement}
            </Paper>
              <Form.Button
                type='submit'
                label='Submit'
                fullWidth={true}
              />
              <div style={{
                ...BernieText.default,
                fontSize: '0.7em',
                color: BernieColors.white,
                marginTop: 10
              }}>
              </div>
          </GCForm>
        </div>
      </Paper>
    )
  }

  render() {
    const team = slacks[this.props.params.team]
    return (
      <MuiThemeProvider muiTheme={Styles.getMuiTheme(BernieTheme)}>
        <div style={this.styles.container} >
          <h2 style={{
            ...BernieText.secondaryTitle,
            display: 'block'
          }}>
            Organize on Slack
          </h2>
          <h1 style={{
            ...BernieText.title,
            marginBottom: 0
          }}>
            Join "{team.title}"
          </h1>
          <p style={{
            ...BernieText.default,
            marginBottom: '1em'
          }}>
            {team.description}
          </p>
          <div styles={this.styles.formContainer}>
            {this.renderForm()}
          </div>
        </div>
      </MuiThemeProvider>
    )
  }
}
