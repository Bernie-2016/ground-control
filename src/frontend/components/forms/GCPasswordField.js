import React from 'react';
import {TextField} from 'material-ui';

export default class GCPasswordField extends React.Component {
  render() {
    return <TextField
      {...this.props}
      type='password'
      hintText={this.props.label}
      onChange={(event) => {this.props.onChange(event.target.value)}}
    />
  }
}