import React from 'react';
import Relay from 'react-relay';
import {BernieText, BernieColors} from './styles/bernie-css'
import Radium from 'radium'
import TopNav from './TopNav';

@Radium
class UserAccountDashboard extends React.Component {
  styles = {
    container: {
      paddingLeft: 0,
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 40,
    },
    paragraph: {
      paddingTop: '0.5em',
      paddingBottom: '0.5em',
      paddingLeft: '0.5em',
      paddingRight: '0.5em',
    },
  }

  render() {
    return (
      <div>
        <TopNav
          zDepth={0}
          barColor={BernieColors.lightGray}
          tabColor={BernieColors.darkGray}
          selectedTabColor={BernieColors.gray}
          logoColors={{
            primary: BernieColors.blue,
            swoosh: BernieColors.red
          }}
          tabs={[
          {
            value: '/call',
            label: 'Make Calls'
          }]}
          history={this.props.history}
          location={this.props.location}
        />
        <div style={{
          padding: '40px 40px 40px 40px'
        }}>
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