import React from 'react';
import BernieLogo from './BernieLogo';
import {BernieColors, BernieText} from './styles/bernie-css';
import {BernieTheme} from './styles/bernie-theme';
import {AppBar, Styles, Tabs, Tab} from 'material-ui';

@Styles.ThemeDecorator(Styles.ThemeManager.getMuiTheme(BernieTheme))
export default class Dashboard extends React.Component {
  static propTypes = {
    logoColors: React.PropTypes.shape({
      primary: React.PropTypes.string,
      swoosh: React.PropTypes.string
    }),
    sections: React.PropTypes.arrayOf(React.PropTypes.shape({
      label: React.PropTypes.string,
      link: React.PropTypes.string,
      component: React.PropTypes.object
    })),
    barColor: React.PropTypes.string,
    tabColor: React.PropTypes.string,
    selectedTabColor: React.PropTypes.string,
    selectedSection: React.PropTypes.string,
    navigateTo: React.PropTypes.func
  }

  styles = {
    logo: {
      width: 96,
      height: 40
    },
    bar: {
      height: 56,
      minHeight: 56
    },
    tab: {
      ...BernieText.secondaryTitle,
      fontSize: '1rem',
    }
  }

  renderSelectedComponent() {
    let component = <div>Not found</div>
    if (this.props.selectedSection) {
      this.props.sections.forEach((section) => {
        if (section.link === this.props.selectedSection) {
          component = section.component;
        }
      })
    }
    return component;
  }

  render() {
    let tabs = []
    this.props.sections.forEach((tab) => {
      tabs.push(<Tab
        label={tab.label}
        style={{
          ...this.styles.tab,
          color: tab.link === this.props.selectedSection ? this.props.selectedTabColor : this.props.tabColor,
          backgroundColor: this.props.color
        }}
        value={tab.link}
      />)
    })

    return (
      <div>
        <AppBar
          {...this.props}
          style={{
            ...this.styles.bar,
            backgroundColor: this.props.barColor
          }}
          iconElementLeft={
            <BernieLogo
              color={this.props.logoColors.primary}
              bottomSwooshColor={this.props.logoColors.swoosh}
              viewBox="0 0 480 200"
              style={this.styles.logo}
          />}
          iconElementRight={
            <Tabs valueLink={{
              value: this.props.selectedSection,
              requestChange: (value, event, tab) => this.props.navigateTo(value)}}>
              {tabs}
            </Tabs>
          }
        />
        {this.renderSelectedComponent()}
      </div>
    )
  }
}