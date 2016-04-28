import React from 'react'
import {Styles, RaisedButton, FlatButton, Paper, TextField} from 'material-ui'
import {BernieText, BernieColors} from './styles/bernie-css'
import {BernieTheme} from './styles/bernie-theme'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import yup from 'yup'
import superagent from 'superagent'
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider'
import {slacks} from './data/slacks'

export default class SlackInvite extends React.Component {

  constructor(props) {
    super(props)

    if (slacks[this.props.params.team] === undefined)
      this.props.history.push('/slack')

    this.state = {
      formState: 'signup',
      errorMessage: null,
      email: null
    }
  }

  slackTeam = {
    ...slacks[this.props.params.team],
    id: this.props.params.team
  }

  formSchema = yup.object({
    email: yup.string().email().required(),
  })

  showForm = () => {
    this.setState({formState: 'signup'})
  }

  clearError() {
    this.setState({ errorMessage: null })
  }

  setError(errorMessage) {
    this.setState({errorMessage})
  }

  onSubmit = (formState) => {
    this.clearError()
    const email = formState.email
    superagent
      .post('/slack-invites')
      .send({email, slackTeam: this.slackTeam.id})
      .end((err, res) => {
        const response = JSON.parse(res.text)
        if (response.ok) {
          this.setState({formState: 'submitted', email})
        }
        else {
          const error = response.error || err
          switch (error) {
            case 'already_invited':
              this.setError(`${email} has already received an invitation!`)
              break
            case 'already_in_team':
              this.setError(`${email} is already in ${this.slackTeam.title}`)
              break
            default:
              console.error(error)
              this.setError('Whoops! An error occurred. Please try again later, or email help@berniesanders.com.')
          }
        }
      })
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
    }
  }

  renderForm() {
    if (this.state.formState === 'signup')
      return (
        <Paper style={this.styles.signupForm}>
          <GCForm
            schema={this.formSchema}
            onSubmit={this.onSubmit}
          >
            <h1 style={{
                ...BernieText.title,
                color: BernieColors.white,
                fontSize: '1.5em'
            }}>
              Enter your email address:
            </h1>
            <Paper zDepth={0} style={{
              padding: 15,
              marginTop: 15,
              marginBottom: 15
            }}>
              <Form.Field
                name='email'
                label='E-mail Address'
                hintText='Email'
                type='email'
                floatingLabelText={false}
                fullWidth={true}
                errorText={this.state.errorMessage}
                style={{textAlign: 'left'}}
              />
            </Paper>
              <Form.Button
                type='submit'
                label='Send Invite'
                fullWidth={true}
              />
          </GCForm>
        </Paper>
      )
    else
      return (
        <div style={{
          ...BernieText.default,
          color: BernieColors.darkGreen,
          maxWidth: 600,
          margin: '0 auto'
        }}>
          Success! <strong>{this.state.email}</strong> has been invited to join <strong>{this.slackTeam.title}</strong>.  Check your email for next steps.
          <br /><br />
          <RaisedButton
            label={`Go to ${this.slackTeam.title}`}
            secondary={true}
            linkButton={true}
            href={`https://${this.slackTeam.id}.slack.com`}
          />
          <br /><br />
          <FlatButton label="Send Another Invite" primary={true} onClick={this.showForm} />
        </div>
      )
  }

  render() {
    
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
            Join "{this.slackTeam.title}"
          </h1>
          <p style={{
            ...BernieText.default,
            margin: '0 auto',
            marginBottom: '1em',
            maxWidth: 600
          }}>
            {this.slackTeam.description}
          </p>
          <div styles={this.styles.formContainer}>
            {this.renderForm()}
          </div>
        </div>
      </MuiThemeProvider>
    )
  }
}
