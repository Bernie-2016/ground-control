import React from 'react';
import BernieLogo from './BernieLogo';
import {BernieColors, BernieText} from './styles/bernie-css';
import {AppBar, Styles, Tabs, Tab} from 'material-ui';
import superagent from 'superagent';

export default class TopNav extends React.Component {
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
    location: React.PropTypes.object
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

  logoutHandler = (event) => {
    superagent
      .post('/logout')
      .end((err, res) => {
        if (!err)
          window.location = '/signup';
        else
          return;
        })
  }

  render() {
    let tabs = []
    let selectedTab = this.props.tabs.filter((tab) => {
      return this.props.location.pathname.indexOf(tab.value) === 0
    })[0]

    if (selectedTab)
      selectedTab = selectedTab.value

    this.props.tabs.forEach((tab) => {
      tabs.push(<Tab
        label={tab.label}
        style={{
          ...this.styles.tab,
          color: tab.value === selectedTab ? this.props.selectedTabColor : this.props.tabColor,
          backgroundColor: this.props.barColor
        }}
        value={tab.value}
        key={tab.value}
        onActive={() => { this.props.history.push(tab.value) }}
      />)
    })
    tabs.push(<Tab
        label={'Logout'}
        onActive={this.logoutHandler}
        style={{
          ...this.styles.tab,
          color: this.props.tabColor,
          backgroundColor: this.props.barColor
        }}
        value='logout'
        key='logout'
      />)

    return (
      <div>
        <AppBar
          {...this.props}
          zDepth={1}
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
            <div style={{top: '-4px', position: 'relative'}}>
              {this.props.extraTop}
              <Tabs valueLink={{
                value: selectedTab ? selectedTab : 'none',
                requestChange: (value, event, tab) => {
                  this.props.history.push(value)
                }}}
              >
                {tabs}
              </Tabs>
            </div>
          }
        />
      </div>
    )
  }
}
