import React from 'react';
import Relay from 'react-relay';
import {BernieColors} from './styles/bernie-css';
import {AppBar, Styles, Tabs, Tab} from 'material-ui';
import BernieLogo from './BernieLogo';
import {Route} from './TreeRouter';

@Route(':section/:subpath')
class VolunteerDashboard extends React.Component {
  styles = {
    logo: {
      width: 96,
      height: 40
    },
    bar: {
      backgroundColor: BernieColors.lightGray,
      minHeight: 56,
      height: 56
    },
    tabs: {
      color: BernieColors.gray,
      backgroundColor: BernieColors.lightGray
    },
    tabsContainer: {
      verticalAlign: 'middle',
      width: 600
    }
  }
  render() {
    return (
      <div>
        <AppBar
          style={this.styles.bar}
          zDepth={0}
          title=""
          iconElementLeft={
            <BernieLogo
              color={BernieColors.blue}
              bottomSwooshColor={BernieColors.red}
              viewBox="0 0 480 200"
              style={this.styles.logo}
          />}
          iconElementRight={
            <Tabs>
              <Tab label="Make Calls" style={this.styles.tabs} />
              <Tab label="Join Group Calls" style={this.styles.tabs} />
              <Tab label="Attend Events" style={this.styles.tabs} />
              <Tab label="Share with Friends" style={this.styles.tabs} />
              <Tab label="Dashboard" style={this.styles.tabs} />
            </Tabs>
          }
          iconStyleRight={this.styles.tabsContainer} />
      </div>
    )
  }
}

export default Relay.createContainer(VolunteerDashboard, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        survey(id:$id) {
          ${Survey.getFragment('survey')}
        }
      }
    `
  }
});