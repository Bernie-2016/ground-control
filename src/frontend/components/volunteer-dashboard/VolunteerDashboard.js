import React from 'react';
import Relay from 'react-relay';
import Signup from './Signup';
import {BernieText} from './styles/bernie-css'
import Radium from 'radium';

@Radium
class VolunteerDashboard extends React.Component {
  styles = {
    introContainer: {
      display: 'flex',
      flexDirection: 'row'
    },
    introTextContainer: {
      flex: 1,
      marginRight: 40
    },
    signupForm: {
      flex: 'auto',
      width: '12em'
    },
    container: {
      paddingLeft: 40,
      paddingTop: 40,
      paddingRight: 40,
      paddingBottom: 40
    },
    paragraph: {
      paddingTop: '0.5em',
      paddingBottom: '0.5em',
      paddingLeft: '0.5em',
      paddingRight: '0.5em',
    },
  }

  renderIntroduction() {
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
              Get involved in the political revolution
            </div>
            <div style={BernieText.default}>
              <p style={this.styles.paragraph}>
                We must launch a political revolution which engages millions of Americans from all walks of life in the struggle for real change. This country belongs to all of us, not just the billionaire class. And that’s what this campaign is all about.
                </p>
                <p style={this.styles.paragraph}>
                  To win this campaign, all of us must be deeply involved. Our movement needs people like you to help it succeed.
                </p>
                <p style={this.styles.paragraph}>
                  Add your name now to volunteer for our campaign for president.
                </p>
                <p style={this.styles.paragraph}>
                  Thanks for all you do,
                </p>
                <img src='https://s.bsd.net/bernie16/main/page/-/Email%20Images/sig-red.png' width='170' alt='Bernie' />
            </div>
          </div>
          <div styles={this.styles.signupForm}>
            <Signup />
          </div>
        </div>
      </div>
    )
  }

  name() {
    return this.props.currentUser.firstName + ' ' + this.props.currentUser.lastName
  }

  renderDashboard() {
    return (
      <div style={this.styles.container}>
        <div style={BernieText.title}>
        Welcome {this.name()}!
        </div>
      </div>
    )
  }

  render() {
    let contentView = this.renderIntroduction();
    if (this.props.currentUser) {
      contentView = this.renderDashboard();
    }
    return contentView;
  }
}

export default Relay.createContainer(VolunteerDashboard, {
  fragments: {
    currentUser: () => Relay.QL`
      fragment on Person {
        firstName
        lastName
      }
    `,
  },
});