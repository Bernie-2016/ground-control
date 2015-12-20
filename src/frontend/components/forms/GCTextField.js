import React from 'react';
import {TextField} from 'material-ui';
import {BernieText} from '../styles/bernie-css';

export default class GCTextField extends React.Component {
  render() {
    let floatingLabelText = this.props.floatingLabelText || this.props.label

    return <TextField
      {...this.props}
      floatingLabelText={floatingLabelText}
      errorStyle={BernieText.inputError}
      hintText={this.props.label}
      onChange={(event) => {this.props.onChange(event.target.value)}}
    />
  }
}