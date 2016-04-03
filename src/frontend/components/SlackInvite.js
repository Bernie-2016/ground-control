import React from 'react';
import {Paper, TextField} from 'material-ui';
import {BernieText, BernieColors} from './styles/bernie-css';
import GCForm from './forms/GCForm';
import Form from 'react-formal';
import yup from 'yup';
import superagent from 'superagent';
import {Styles} from 'material-ui';
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider'
import {BernieTheme} from './styles/bernie-theme';

export default class SlackInvite extends React.Component {
  state = {
    slackTeam: this.props.routeParams.team,
    formState: 'signup',
    errorMessage: null,
  }

  titleize = {
    'afam4bernie': 'African Americans for Bernie',
    'bernie2016states': 'Bernie 2016 States',
    'berniebarnstorms': 'Bernie Barnstorms',
    'berniebuilders': 'Bernie Builders',
    'callforbernie': 'Call for Bernie',
    'codersforsanders': 'Coders for Sanders'
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
          />
          <br />
          <br />
        </div>
      ),
      onSubmit: (formState) => {
        this.clearError();
        superagent
          .post('/slack_invites')
          .send({
            email: formState.email,
            slackTeam: this.state.slackTeam
          })
          .end((err, res) => {
            if (!err) {
              this.redirectToNext();
            } else {
              this.setState({errorMessage: 'Whoops! An error occurred. Please try again!'});
            }
          })
      }
    }
  }

  styles = {
    signupForm: {
      width: '100%',
      maxWidth: '400px',
      backgroundColor: BernieColors.blue,
      color: BernieColors.white,
      padding: '15px 15px 15px 15px'
    },
    paragraph: {
      padding: '0.5em'
    },
    introContainer: {
      display: 'flex',
      flexDirection: 'row'
    },
    introTextContainer: {
      flex: 1,
      marginRight: 40
    },
    formContainer: {
      flex: 'auto',
      width: '12em',
    },
    container: {
      padding: '40px'
    },
    errorMessage: {
      ...BernieText.default,
      color: BernieColors.lightRed,
      fontSize: '0.8em',
      marginTop: 15,
      textAlign: 'center'
    }
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
              Organize
            </div>
            <div style={BernieText.title}>
              Chat with "{this.titleize[this.state.slackTeam]}"
            </div>

            <div styles={this.styles.formContainer}>
              {this.renderForm()}
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderForm() {
    let state = this.formStates[this.state.formState];
    let formElement = state.formElement;
    let formTitle = state.formTitle;
    let formSchema = state.formSchema;
    let submitHandler = state.onSubmit;
    let errorElement = <div></div>;

    if (this.state.errorMessage) {
      errorElement = <div style={this.styles.errorMessage}>{this.state.errorMessage}</div>;
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
    return (
      <MuiThemeProvider muiTheme={Styles.getMuiTheme(BernieTheme)}>
        {this.renderSplash()}
      </MuiThemeProvider>
    )
  }
}
