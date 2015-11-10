import React from 'react';
import Relay from 'react-relay';
import {Styles} from 'material-ui';
import GroupCallAdmin from './GroupCallAdmin';
import TopBar from './TopBar';
import {BernieTheme} from './styles/bernie-theme';
import {BernieColors} from './styles/bernie-css';
import url from 'url';

@Styles.ThemeDecorator(Styles.ThemeManager.getMuiTheme(BernieTheme))
class AdminDashboard extends React.Component {
  sections = {
    'group-calls' : {
      label: 'Group Calls',
      component: () => {
        return (
          <GroupCallAdmin
            navigateTo={(path) => {
              this.navigateTo('group-calls/' + path)
            }}
            path={this.subPath()}
            viewer={this.props.viewer}
          />
        )
      }
    },
    'call-assignments' : {
      label: 'Call Assignments',
      component: GroupCallAdmin
    }
  }

  navigateTo(path) {
    this.props.history.pushState(null, url.resolve('/admin/', path));
  }

  path() {
    return this.props.routeParams.splat;
  }

  subPath() {
    let parts = this.path().split('/')
    return parts.slice(1, parts.length).join('/')
  }

  renderSelectedComponent() {
    let pathParts = this.path().split('/')
    let section = pathParts[0]
    if (section && this.sections[section])
      return this.sections[section].component();
    else
      return <div>'Not found'</div>
  }

  render() {
    let tabs = []
    Object.keys(this.sections).forEach((slug) => {
      tabs.push({
        label: this.sections[slug].label,
        onClick: () => {
          this.navigateTo(slug);
        }
      })
    })
    return (
      <div>
        <TopBar
          color={BernieColors.blue}
          tabColor={Styles.Colors.white}
          selectedTabColor={BernieColors.lightBlue}
          zDepth={1}
          title="Ground Control"
          titleColor={BernieColors.red}
          logoColors={{
            primary: Styles.Colors.white,
            swoosh: BernieColors.gray
          }}
          tabs={tabs}
        />
        {this.renderSelectedComponent()}
      </div>
    )
  }
}

export default Relay.createContainer(AdminDashboard, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${GroupCallAdmin.getFragment('viewer')}
      }
    `
  }
});