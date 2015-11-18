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
      minHeight: '800px',
      borderRight: 'solid 1px ' + BernieColors.lightGray,
      zIndex: -1
    },

    content: {
      display: 'flex',
      flex: 1,
    }
  }

  render() {
    return (
      <div zDepth={1} style={this.styles.container}>
        <div zDepth={0} style={this.styles.sideBar}>
          {this.props.sideBar}
        </div>
        <div zDepth={0} style={
          {
            ...this.styles.content,
            ...this.props.contentViewStyle
          }}>
          {this.props.content}
        </div>
      </div>
    )
  }
}