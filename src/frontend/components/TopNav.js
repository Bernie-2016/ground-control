import React from 'react'
import Radium from 'radium'
import BernieLogo from './BernieLogo'
import {BernieColors, BernieText, MediaQueries} from './styles/bernie-css'
import {AppBar, Styles, Tabs, Tab, MenuItem, IconButton, IconMenu, FontIcon} from 'material-ui'
import superagent from 'superagent'

const NAVBAR_HEIGHT = 48

@Radium
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
      height: 38
    },
    bar: {
      height: NAVBAR_HEIGHT,
      minHeight: NAVBAR_HEIGHT,
      position: 'fixed',
      top: 0,
      left: 0,
      boxSizing: 'border-box'
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
          window.location = '/signup'
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
        onActive={(typeof tab.onActive === 'function') ? tab.onActive : () => { this.props.history.push(tab.value) }}
      />)
    })

    return (
      <div>
        <AppBar
          {...this.props}
          style={{
            ...this.styles.bar,
            backgroundColor: this.props.barColor,
            boxSizing: 'border-box'
          }}
          titleStyle={{lineHeight: NAVBAR_HEIGHT + 'px'}}
          iconStyleRight={{marginTop: -7}}
          iconElementLeft={
            <div style={{
              position: 'relative',
              top: -4,
              [MediaQueries.onMobile]: {
                display: 'none'
              }
            }}>
              <BernieLogo
                color={this.props.logoColors.primary}
                bottomSwooshColor={this.props.logoColors.swoosh}
                viewBox="0 0 480 200"
                style={this.styles.logo}
              />
            </div>
          }
          iconElementRight={
            <div>
              {this.props.extraTop}
              <div style={{
                minWidth: 430,
                display: 'inline-block',
                lineHeight: NAVBAR_HEIGHT + 'px',
                [MediaQueries.onMobile]: {minWidth: 328}
              }}>
                <Tabs valueLink={{
                  value: selectedTab ? selectedTab : 'none',
                  requestChange: (value, event, tab) => {
                    this.props.history.push(value)
                  }}}
                >
                  {tabs}
                </Tabs>
              </div>
              <IconMenu
                style={{top: 7}}
                iconStyle={{
                  color: this.props.tabColor
                }}
                iconButtonElement={
                  <IconButton>
                    <FontIcon className="material-icons">
                      more_vert
                    </FontIcon>
                  </IconButton>
                }
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
              >
                <MenuItem primaryText="Account Settings" onTouchTap={() => this.props.history.push('/account')} />
                <MenuItem primaryText="Sign Out" onTouchTap={this.logoutHandler} />
              </IconMenu>
            </div>
          }
        />
        <div style={{height: NAVBAR_HEIGHT, width: '100%'}}></div>
      </div>
    )
  }
}
