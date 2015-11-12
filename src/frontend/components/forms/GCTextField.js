import React from 'react';
import {TextField} from 'material-ui';

export default class GCTextField extends React.Component {
  render() {
    return <TextField
      {...this.props}
      hintText={this.props.label}
      floatingLabelText={this.props.label}
    />
  }
}