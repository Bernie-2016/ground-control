import React from 'react';
import {Styles, Paper} from 'material-ui';

export default class AdminSection extends React.Component {
  styles = {
    container: {
      position: 'relative'
    },

    sideBar: {
      display: 'inline-block',
      width: 200,
      minHeight: '800px',
      border: 'solid 1px ' + Styles.Colors.grey300,
    },

    content: {
      display: 'inline-block',
      verticalAlign: 'top'
    }
  }

  render() {
    return (
      <Paper style={this.styles.container}>
        <Paper zDepth={0} style={this.styles.sideBar}>
          {this.props.sideBar}
        </Paper>
        <Paper zDepth={0} style={this.styles.content}>
          {this.props.content}
        </Paper>
      </Paper>
    )
  }
}