import React from 'react';
import {TextField} from 'material-ui';
import {BernieText} from '../styles/bernie-css';
import GCFormField from './GCFormField';
import phoneFormatter from 'phone-formatter';

export default class GCPhoneField extends GCFormField {
  
  render() {
    return <TextField
      {...this.props}
      //FIXME The binding to value here is causing issue #514
      value={this.props.value ? phoneFormatter.format(this.props.value, '(NNN) NNN-NNNN') : ''}
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