import React from 'react';
import Relay from 'react-relay';
import {Styles} from 'material-ui';
import GroupCallAdmin from './GroupCallAdmin';
import CallAssignmentAdmin from './CallAssignmentAdmin';
import TopBar from './TopBar';
import {BernieTheme} from './styles/bernie-theme';
import {BernieColors} from './styles/bernie-css';
import url from 'url';
import {Route} from './TreeRouter';

@Styles.ThemeDecorator(Styles.ThemeManager.getMuiTheme(BernieTheme))
@Route(':section/:subpath')
class AdminDashboard extends React.Component {
  sections = {
    'group-calls' : {
      label: 'Group Calls',
      component: GroupCallAdmin
    },
    'call-assignments' : {
      label: 'Call Assignments',
      component: CallAssignmentAdmin
    }
  }

  renderSelectedComponent() {
    if (this.props.section && this.sections[this.props.section]) {
      let Section = this.sections[this.props.section].component;
      return (
        <Section
          parentPath={this.props.path}
          path={this.props.subpath}
          viewer={this.props.viewer}
          navigateTo={this.props.navigateTo}
        />
      )
    }
    else
      return <div>Not found</div>
  }

  render() {
    let tabs = []
    Object.keys(this.sections).forEach((slug) => {
      tabs.push({
        label: this.sections[slug].label,
        value: slug
      })
    })
    return (
      <div>
        <TopBar
          color={BernieColors.blue}
          tabColor={BernieColors.lightBlue}
          selectedTabColor={Styles.Colors.white}
          zDepth={0}
          title="Ground Control"
          titleColor={BernieColors.red}
          logoColors={{
            primary: Styles.Colors.white,
            swoosh: BernieColors.gray
          }}
          tabs={tabs}
          selectedTabValue={this.props.section}
          tabChanged={(slug) => this.props.navigateTo(slug)}
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
        ${CallAssignmentAdmin.getFragment('viewer')}
      }
    `
  }
});