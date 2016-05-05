import React from 'react'
import Relay from 'react-relay'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import {colors as MaterialColors} from 'material-ui/styles'
import TopNav from './TopNav'
import {BernieTheme} from './styles/bernie-theme'
import {BernieColors} from './styles/bernie-css'
import Radium from 'radium'

const bernieMuiTheme = getMuiTheme(BernieTheme)

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
    // {
    //   value: 'https://organize.berniesanders.com/slack/berniebuilders',
    //   label: 'Gather Online'
    // },
  ]

  renderTopNav() {
    return (
      <TopNav
        barColor={BernieColors.blue}
        tabColor={BernieColors.lightBlue}
        selectedTabColor={MaterialColors.white}
        title="Ground Control"
        logoColors={{
          primary: MaterialColors.white,
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
      <MuiThemeProvider muiTheme={bernieMuiTheme}>
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