import React from 'react';
import Relay from 'react-relay';
import Survey from './Survey'
import {BernieText} from './styles/bernie-css'

export default class Introduction extends React.Component {
  styles = {
    container: {
      paddingLeft: 40,
      paddingTop: 40,
      paddingRight: 40,
      paddingBottom: 40,
      width: 720
    },
    paragraph: {
      paddingTop: '0.5em',
      paddingBottom: '0.5em',
      paddingLeft: '0.5em',
      paddingRight: '0.5em',

    }
  }
  render() {
    return (
      <div style={this.styles.container}>
        <div style={BernieText.secondaryTitle}>
          Volunteer
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
    )
  }
}