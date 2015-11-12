import React from 'react';
import Relay from 'react-relay';
import {Styles} from 'material-ui';
import GroupCallAdmin from './GroupCallAdmin';
import CallAssignmentAdmin from './CallAssignmentAdmin';
import Dashboard from './Dashboard';
import {BernieTheme} from './styles/bernie-theme';
import {BernieColors} from './styles/bernie-css';
import url from 'url';
import {Route} from './TreeRouter';

@Styles.ThemeDecorator(Styles.ThemeManager.getMuiTheme(BernieTheme))
@Route(':section/:subpath')
class AdminDashboard extends React.Component {
  componentFactory(componentClass) {
    let Section = componentClass;
    return (
      <Section
        parentPath={this.props.path}
        path={this.props.subpath}
        viewer={this.props.viewer}
        navigateTo={this.props.navigateTo}
      />
    )
  }

  sections() {
    return [{
      link:'group-calls',
      label: 'Group Calls',
      component: this.componentFactory(GroupCallAdmin)
    },
    {
      link: 'call-assignments',
      label: 'Call Assignments',
      component: this.componentFactory(CallAssignmentAdmin)
    }]
  }

  render() {
    return (
      <div>
        <Dashboard
          barColor={BernieColors.blue}
          tabColor={BernieColors.lightBlue}
          selectedTabColor={Styles.Colors.white}
          title="Ground Control"
          logoColors={{
            primary: Styles.Colors.white,
            swoosh: BernieColors.gray
          }}
          sections={this.sections()}
          selectedSection={this.props.section}
          navigateTo={this.props.navigateTo}
        />
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