import React from 'react';
import {BernieText, BernieColors} from '../styles/bernie-css'
import GCFormField from './GCFormField';
import {SelectField, MenuItem} from 'material-ui';

export default class GCSelectField extends GCFormField {
  createMenuItems() {
    return Object.keys(this.props.choices).map((choice) => {
      return (
        <MenuItem value={choice} key={choice} primaryText={this.props.choices[choice]} />
      )
    })
  }

  render() {
    return (
      <SelectField
        children={this.createMenuItems()}
        errorStyle={BernieText.inputError}
        hintText={this.props.label}
        {...this.props}
        onChange={(event, index, value) => {
          this.props.onChange(value)
        }}
      />
    )
  }
}