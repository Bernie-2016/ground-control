import React from 'react';
import Relay from 'react-relay';
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
    formState: 'signup',
    errorMessage: null,
  }

  clearError() {
    this.setState({errorMessage: null})
  }

  redirectToNext() {
    let queryDict = {};
    location.search.substr(1).split("&").forEach((item) => {
      queryDict[item.split("=")[0]] = item.split("=")[1]
    })

    window.location = queryDict.next || '/call';
  }

  formStates = {
    signup: {
      formTitle: 'Login or sign up make calls',
      formSchema: yup.object({
        email: yup.string().email().required(),
        password: yup.string().required(),
      }),
      formElement: (
        <div>
          <Form.Field
            name='email'
            label='E-mail Address'
            floatingLabelText={false}
          />
          <br />
          <Form.Field
            name='password'
            type='password'
            label='Password'
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
              this.setState({errorMessage: 'Incorrect e-mail or password'});
            }
          })
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
          <div style={this.styles.introTextContainer}>
            <div style={{
              ...BernieText.secondaryTitle,
              display: 'block'
            }}>
              Make Calls
            </div>
            <div style={BernieText.title}>
              It takes a nation of millions to move us forward
            </div>
            <div style={BernieText.default}>
              <p style={this.styles.paragraph}>
                Bernie has said time and time again that the only way to bring about meaningful change in the White House is if millions of us get involved.  We know that making one-on-one calls is the most effective way to mobilize people, and we need your help making it happen.
                </p>
                <p style={this.styles.paragraph}>
                  Once you sign up, we'll post assignments regularly.  You will be talking to people who have already signed up to be a part of this campaign - your job is to make sure everyone is able to live up to their potential. With your help, we can grow this into a movement of millions.
                </p>

                <p style={this.styles.paragraph}>
                  Will you sign up to make this political revolution a reality?
                </p>
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
    let signupState = this.formStates[this.state.formState];
    let formElement = signupState.formElement;
    let formTitle = signupState.formTitle;
    let formSchema = signupState.formSchema;
    let submitHandler = signupState.onSubmit;
    let errorElement = <div></div>

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
    return this.renderSplash();
  }
}
