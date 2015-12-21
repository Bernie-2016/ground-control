import React from 'react';
import {TextField} from 'material-ui';
import {BernieText} from '../styles/bernie-css';

export default class GCPasswordField extends React.Component {
  render() {
    let floatingLabelText = this.props.floatingLabelText === false ? null : floatingLabelText || this.props.label;

    return <TextField
      {...this.props}
      floatingLabelText={floatingLabelText}
      type='password'
      errorStyle={BernieText.inputError}
      hintText={this.props.label}
      onChange={(event) => {this.props.onChange(event.target.value)}}
    />
  }
}