import React from 'react';
import Relay from 'react-relay';
import {Styles} from 'material-ui';
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider'
import TopNav from './TopNav';
import {BernieTheme} from './styles/bernie-theme';
import {BernieColors} from './styles/bernie-css';

class Dashboard extends React.Component {
  tabs = [{
      value:'/call-assignments',
      label: 'Make Calls',
    },
    {
      value: '/events',
      label: 'Events'
    },
    {
      value: 'https://go.berniesanders.com/page/share/share-for-bernie?source=homepage_organize',
      label: 'Share'
    },
    {
      value: 'https://go.berniesanders.com/page/share/share-for-bernie?source=homepage_organize',
      label: 'Resources'
    },
    {
      value: 'https://organize.berniesanders.com/slack/berniebuilders',
      label: 'Gather Online'
    },
  ]

  renderTopNav() {
    return (
      <TopNav
        zDepth={0}
        barColor={BernieColors.lightGray}
        tabColor={BernieColors.darkGray}
        selectedTabColor={BernieColors.gray}
        logoColors={{
          primary: BernieColors.blue,
          swoosh: BernieColors.red
        }}
        tabs={this.tabs}
        history={this.props.history}
        location={this.props.location}
      />
    )
  }

  render() {
    // No volunteer navigation for now.
    return (
      <MuiThemeProvider muiTheme={Styles.getMuiTheme(BernieTheme)}>
        {this.props.children}
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