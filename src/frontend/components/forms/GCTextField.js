import React from 'react';
import {TextField} from 'material-ui';
import {BernieText} from '../styles/bernie-css';
import GCFormField from './GCFormField';

export default class GCTextField extends GCFormField {
  render() {
    return <TextField
      {...this.props}
      floatingLabelText={this.floatingLabelText()}
      errorStyle={BernieText.inputError}
      hintText={this.props.label}
      onChange={(event) => {this.props.onChange(event.target.value)}}
    />
  }
}