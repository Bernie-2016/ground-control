import React from 'react'
import {BernieText, BernieColors} from './styles/bernie-css'
import {Styles} from 'material-ui'
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider'
import {BernieTheme} from './styles/bernie-theme'
import {slacks} from './data/slacks'

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
                Join a slack team to get involved in the revolution!
              </p>
              <ul>
                {Object.keys(slacks).map((key) => <li><a href={`/slack/${key}`}>{slacks[key].title}</a> - {slacks[key].description}</li>)}
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
