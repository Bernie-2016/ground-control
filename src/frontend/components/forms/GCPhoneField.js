import React from 'react';
import {TextField} from 'material-ui';
import {BernieText} from '../styles/bernie-css';
import GCFormField from './GCFormField';

export default class GCPhoneField extends GCFormField {

  render() {
    let phone = this.props.value
    let formattedValue = `(${phone.slice(0, 3)}) ${phone.slice(3,6)}-${phone.slice(6)}`
    return <TextField
      {...this.props}
      value={formattedValue}
      floatingLabelText={this.floatingLabelText()}
      errorStyle={BernieText.inputError}
      hintText={this.props.label}
      onChange={(event) => {
        let val = event.target.value.replace(/\D/g,'')
        this.props.onChange(val)
      }}
    />
  }
}