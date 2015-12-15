import React from 'react';
import {Paper, TextField} from 'material-ui';
import {BernieText, BernieColors} from './styles/bernie-css';
import GCForm from './forms/GCForm';
import Form from 'react-formal';
import yup from 'yup';
import superagent from 'superagent';
import {Styles} from 'material-ui';
import {BernieTheme} from './styles/bernie-theme';

@Styles.ThemeDecorator(Styles.ThemeManager.getMuiTheme(BernieTheme))
export default class Signup extends React.Component {
  state = {
    formState : 'reset',
    errorMessage: null,
    infoMessage: null,
  }

  clearError() {
    this.setState({errorMessage: null});
  }

  clearInfo() {
    this.setState({infoMessage: null});
  }

  formStates = {
    reset: {
      formTitle: 'Reset Lost Password',
      formSchema: yup.object({
        email: yup.string().email().required()
      }),
      formElement: (
        <div>
          <Form.Field
            name='email'
            label='E-mail Address'
          /><br />
        </div>
      ),
      onSubmit: (formState) => {
        this.clearError();
        this.clearInfo();
        superagent
          .post('/password_reset')
          .send({
            email: formState.email
          })
          .end((err, res) => {
            if (!err)
              this.setState({infoMessage: "Please check email for reset instructions"});
            else
              this.setState({errorMessage: 'Server Error'});
          });
      }
    }
  }

  styles = {
    signupForm: {
      width: '100%',
      backgroundColor: BernieColors.blue,
      color: BernieColors.white,
      padding: '15px 15px 15px 15px'
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
      margin: 'auto',
    },
    container: {
      padding: 40,
      paddingTop: 40,
      paddingRight: 40,
      paddingBottom: 40,
    },
    errorMessage: {
      ...BernieText.default,
      color: BernieColors.red,
      fontSize: '0.8em',
      marginTop: 15
    }
  }

  renderSplash() {
    return (
      <div style={this.styles.container} >
        <div style={this.styles.introContainer}>
          <div id="lol" style={this.styles.signupFormContainer}>
            {this.renderSignupForm()}
          </div>
        </div>
      </div>
    )
  }

  renderSignupForm() {
    let signupState = this.formStates[this.state.formState];
    let formElement = signupState.formElement;
    let formTitle = signupState.formTitle;
    let formSchema = signupState.formSchema;
    let submitHandler = signupState.onSubmit;
    let errorElement = <div></div>
    let infoElement = <div></div>
    if (this.state.errorMessage) {
      errorElement = <div style={this.styles.errorMessage}>{this.state.errorMessage}</div>
    }
    if (this.state.infoMessage) {
      infoElement = <div style={this.styles.infoMessage}>{this.state.infoMessage}</div>
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
                label='Reset!'
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
        {infoElement}
      </Paper>
    )
  }

  render() {
    return this.renderSplash();
  }
}
