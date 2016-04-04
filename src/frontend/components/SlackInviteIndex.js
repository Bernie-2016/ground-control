import React from 'react'
import {BernieText, BernieColors} from './styles/bernie-css'
import {Styles} from 'material-ui'
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider'
import {BernieTheme} from './styles/bernie-theme'
import {slacks} from './data/slacks'

console.log(slacks)

export default class SlackInviteIndex extends React.Component {
  styles = {
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
    container: {
      padding: '40px'
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
              Chat with Bernie 2016 Volunteers
            </div>
            <div style={BernieText.default}>
              <p style={this.styles.paragraph}>
                In order for us to achieve our political revolution, there are many different chat rooms that volunteers use, primarily hosted on the Slack platform.
              </p>

              <ul>
                <li>
                  <a href="/slack/afam4bernie">African Americans For Bernie</a> - community of African American activists and allies
                </li>

                <li>
                  <a href="/slack/bernie2016states">Bernie 2016 States</a> - interfacing with volunteers and staff in each state
                </li>

                <li>
                  <a href="/slack/berniebuilders">Bernie Builders</a> - general volunteer chatter
                </li>

                <li>
                  <a href="/slack/callforbernie">Call For Bernie</a> - phonebanking assistance and chatter
                </li>

                <li>
                  <a href="/slack/codersforsanders">Coders for Sanders</a> - site development and design chatter
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
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
