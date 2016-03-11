import React from 'react';
import Relay from 'react-relay';
import {Styles} from 'material-ui';
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider';
import TopNav from './TopNav';
import {BernieTheme} from './styles/bernie-theme';
import {BernieColors} from './styles/bernie-css';

class AdminDashboard extends React.Component {
  tabs = [
    {
      value: '/admin/call-assignments',
      label: 'Calls'
    },
    {
      value: '/admin/constituent-lookup',
      label: 'People'
    },
    {
      value: '/admin/events',
      label: 'Events'
    }
  ];

  render() {
    return (
      <MuiThemeProvider muiTheme={Styles.getMuiTheme(BernieTheme)}>
        <div>
          <TopNav
            barColor={BernieColors.blue}
            tabColor={BernieColors.lightBlue}
            selectedTabColor={Styles.Colors.white}
            title="Ground Control Admin"
            logoColors={{
              primary: Styles.Colors.white,
              swoosh: BernieColors.gray
            }}
            tabs={this.tabs}
            history={this.props.history}
            location={this.props.location}
          />
          {this.props.children}
        </div>
      </MuiThemeProvider>
    )
  }
}

// We only do this to auth protect this component.  Otherwise it is unnecessary.
export default Relay.createContainer(AdminDashboard, {
  fragments: {
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        id
      }
    `
  }
})