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
      value: React.PropTypes.string,
      component: React.PropTypes.object
    })),
    barColor: React.PropTypes.string,
    tabColor: React.PropTypes.string,
    selectedTabColor: React.PropTypes.string,
    selectedTab: React.PropTypes.string,
    history: React.PropTypes.object,
    onTabSelect: React.PropTypes.func
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

  render() {
    let tabs = []
    this.props.tabs.forEach((tab) => {
      tabs.push(<Tab
        label={tab.label}
        style={{
          ...this.styles.tab,
          color: tab.value === this.props.selectedTab ? this.props.selectedTabColor : this.props.tabColor,
          backgroundColor: this.props.color
        }}
        value={tab.value}
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
              value: this.props.selectedTab,
              requestChange: (value, event, tab) => this.props.onTabSelect(value, event, tab)}}
            >
              {tabs}
            </Tabs>
          }
        />
      </div>
    )
  }
}