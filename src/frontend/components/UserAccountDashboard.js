import React from 'react'
import Relay from 'react-relay'
import {BernieText, BernieColors, MediaQueries} from './styles/bernie-css'
import Radium from 'radium'

@Radium
class UserAccountDashboard extends React.Component {
  styles = {
    container: {
      paddingLeft: 0,
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 40
    },
    paragraph: {
      padding: '0.5em'
    },
    wrapper: {
      padding: 40,
      [MediaQueries.onMobile]: {
        padding: '1em'
      }
    }
  }

  render() {
    return (
      <div style={this.styles.wrapper}>
        <div style={BernieText.title}>
          Account Settings
        </div>
        <div style={BernieText.default}>
          <p style={this.styles.paragraph}>
            Logged in as <span style={{fontWeight: 'bold'}}>{this.props.currentUser.email}</span>.
          </p>
        </div>
        {this.props.children}
      </div>
    )
  }
}

export default Relay.createContainer(UserAccountDashboard, {
  fragments: {
    currentUser: () => Relay.QL`
      fragment on User {
        email
      }
    `
  }
})