import React from 'react';
import {TextField} from 'material-ui';

export default class GCTextField extends React.Component {
  render() {
    let name = this.props.name;
    let error = this.props.errors ? this.props.errors[this.props.name] : null;
    if (error) {
      error = error[0] ? error[0].message.replace(name, this.props.label) : null;

    }
    return <TextField
      {...this.props}
      errorText={error}
      onChange={(event) => {this.props.onChange(event.target.value)}}
      floatingLabelText={this.props.label}
    />
  }
}