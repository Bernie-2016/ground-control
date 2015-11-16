import React from 'react';
import {Styles, Paper} from 'material-ui';

export default class SideBarLayout extends React.Component {
  styles = {
    container: {
      position: 'relative'
    },

    sideBar: {
      display: 'inline-block',
      width: 200,
      minHeight: '800px',
      borderRight: 'solid 1px ' + Styles.Colors.grey300,
    },

    content: {
      display: 'inline-block',
      verticalAlign: 'top',
      marginLeft: 15,
      marginTop: 15,
      marginRight: 15,
      marginBottom: 15,
    }
  }

  render() {
    return (
      <Paper zDepth={1} style={this.styles.container}>
        <div style={this.styles.sideBar}>
          {this.props.sideBar}
        </div>
        <div style={this.styles.content}>
          {this.props.content}
        </div>
      </Paper>
    )
  }
}