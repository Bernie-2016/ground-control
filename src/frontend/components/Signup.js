import React from 'react';
import {Paper} from 'material-ui';

export default class Signup extends React.Component {
  style = {
    container: {
      width: '100%'
    }
  }
  render() {
    return (
      <Paper style={this.styles.container}>
        Hello
      </Paper>
    )
  }
}