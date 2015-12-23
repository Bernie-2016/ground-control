import React from 'react';
import {Styles, Paper} from 'material-ui';
import {BernieColors} from './styles/bernie-css';
import Radium from 'radium';

@Radium
export default class SideBarLayout extends React.Component {
  styles = {
    container: {
      display: 'flex',
      border: 'solid 1px ' + BernieColors.lightGray
    },

    sideBar: {
      width: '12em',
      borderRight: 'solid 1px ' + BernieColors.lightGray
    },

    content: {
      display: 'flex',
      flex: 1,
    }
  }

  render() {
    let sideBarPosition = this.props.sideBarPosition || 'left'
    let sideBar = (
      <div zDepth={0} style={{
        ...this.styles.sideBar,
        ...this.props.sideBarStyle
      }}>
        {this.props.sideBar}
      </div>
    )

    let content = (
      <div zDepth={0} style={
        {
          ...this.styles.content,
          ...this.props.contentViewStyle
        }}>
        {this.props.content}
      </div>
    )
    let containerStyle = {
      ...this.styles.container,
      ...this.props.containerStyle
    }
    let body = (
      <div zDepth={1} style={containerStyle}>
        {sideBar}
        {content}
      </div>
    )
    if (sideBarPosition === 'right')
      body = (
        <div zDepth={1} style={containerStyle}>
          {content}
          {sideBar}
        </div>
      )
    return body
  }
}