import React from 'react'
import Relay from 'react-relay'
import {Paper, TextField} from 'material-ui'
import {BernieText, BernieColors} from './styles/bernie-css'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import yup from 'yup'
import superagent from 'superagent'
import {Styles, Tabs, Tab} from 'material-ui'
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider'
import {BernieTheme} from './styles/bernie-theme'

export default class Signup extends React.Component {
  state = {
    formState: 'signup',
    errorMessage: null,
  }

  clearError() {
    this.setState({errorMessage: null})
  }

  redirectToNext() {
    let queryDict = {};
    location.search.substr(1).split("&").forEach((item) => {
      queryDict[item.split("=")[0]] = item.split("=").slice(1).join('=')
    })
    this.props.history.push(queryDict.next || '/call')
  }

  formStates = {
    signup: {
      formTitle: 'Login or sign up to continue',
      formSchema: yup.object({
        email: yup.string().email().required(),
        password: yup.string().required(),
      }),
      formElement: (
        <div>
          <Form.Field
            name='email'
            label='Email address'
            hintText='Email Address'
            type='email'
            fullWidth={true}
            floatingLabelText={false}
          />
          <br />
          <Form.Field
            name='password'
            type='password'
            label='Password'
            hintText='Password'
            fullWidth={true}
            floatingLabelText={false}
          />
          <br />
        </div>
      ),
      onSubmit: (formState) => {
        this.clearError();
        superagent
          .post('/signup')
          .send({
            email: formState.email,
            password: formState.password
          })
          .end((err, res) => {
            if (!err) {
              this.redirectToNext();
            } else {
              this.setState({errorMessage: 'Email or password not recognized.'});
            }
          })
      }
    }
  }

  styles = {
    signupForm: {
      width: '100%',
      minWidth: 330,
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
    signupFormContainer: {
      flex: 'auto',
      width: '12em'
    },
    container: {
      padding: '40px'
    },
    errorMessage: {
      ...BernieText.default,
      color: BernieColors.lightRed,
      fontSize: '0.8em',
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
              It takes a nation of millions to move us forward
            </div>
            <div style={BernieText.default}>
              <p style={this.styles.paragraph}>
                Bernie has said time and time again that the only way to bring about meaningful change in the White House is if all of us stand up and say enough is enough.
                </p>

                <p style={this.styles.paragraph}>
                  Will you sign up to make this political revolution a reality?
                </p>
            </div>
          </div>
          <div styles={this.styles.signupFormContainer}>
            <Tabs>
              <Tab label="Log In" >
                <div>
                  {this.renderSignupForm()}
                </div>
              </Tab>
              <Tab label="Create Account" >
                <div>
                  {this.renderSignupForm()}
                </div>
              </Tab>
            </Tabs>
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
    let errorElement = <div></div>;
    let passwordResetElement = <div></div>;

    if (this.state.errorMessage) {
      errorElement = <div style={this.styles.errorMessage}>{this.state.errorMessage}</div>;
      passwordResetElement = <div style={{...this.styles.errorMessage, marginTop: 0}}><a style={{color: BernieColors.lightRed}} target="_blank" href="https://secure.berniesanders.com/page/user/forgot">Click here to request a password reset</a></div>;
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
            {errorElement}
            {passwordResetElement}
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
