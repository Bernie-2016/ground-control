import React from 'react'
import Relay from 'react-relay'
import {Styles} from 'material-ui'
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider'
import TopNav from './TopNav'
import {BernieTheme} from './styles/bernie-theme'
import {BernieColors} from './styles/bernie-css'
import Radium from 'radium'

@Radium
class Dashboard extends React.Component {
  tabs = [{
      value:'/call',
      label: 'Make Calls',
    },
    {
      value: '/events',
      label: 'Events'
    },
    // {
    //   value: 'https://go.berniesanders.com/page/share/share-for-bernie?source=homepage_organize',
    //   label: 'Share'
    // },
    // {
    //   value: 'https://go.berniesanders.com/page/share/share-for-bernie?source=homepage_organize',
    //   label: 'Resources'
    // },
    {
      value: '/slack',
      label: 'Join Slack'
    },
  ]

  renderTopNav() {
    return (
      <TopNav
        barColor={BernieColors.blue}
        tabColor={BernieColors.lightBlue}
        selectedTabColor={Styles.Colors.white}
        title="Ground Control"
        logoColors={{
          primary: Styles.Colors.white,
          swoosh: BernieColors.red
        }}
        tabs={this.tabs}
        history={this.props.history}
        location={this.props.location}
      />
    )
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={Styles.getMuiTheme(BernieTheme)}>
        <div>
          {this.renderTopNav()}
          {this.props.children}
        </div>
      </MuiThemeProvider>
    )
  }
}

// We only do this to auth protect this component.  Otherwise it is unnecessary.
export default Relay.createContainer(Dashboard, {
  fragments: {
    currentUser: () => Relay.QL`
      fragment on User {
        id
      }
    `
  }
})