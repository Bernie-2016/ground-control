import React from 'react';
import {SelectField, MenuItem} from 'material-ui';
import {BernieText, BernieColors} from '../styles/bernie-css'
import GCFormField from './GCFormField';

export default class GCSelectField extends GCFormField {
  styles = {
    label: {
      paddingBottom: 10,
      ...BernieText.inputLabel,
    },
  };

  render() {
    let error = <div></div>;
    let labelStyle = {
      ...this.styles.label,
      ...this.props.labelStyle
    }
    if (this.props.errorText) {
      error = <div style={BernieText.inputError}>{this.props.errorText}</div>
      labelStyle = {
        ...labelStyle,
        color: BernieColors.red
      }
    }

    const menuItems = Object.keys(this.props.choices).map((choice, index) => <MenuItem key={index} value={choice} primaryText={this.props.choices[choice]}/>);

    return (
      <SelectField
        value={this.props.value}
        floatingLabelText={this.floatingLabelText()}
        onChange={(event) => {this.props.onChange(event.target.value)}}
        floatingLabelStyle={{cursor: 'pointer'}}
        errorStyle={BernieText.inputError}
      >
        {menuItems}
      </SelectField>
    )
  }
}