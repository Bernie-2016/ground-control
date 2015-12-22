import React from 'react';
import {BernieText, BernieColors} from '../styles/bernie-css'
import GCFormField from './GCFormField';
import Select from 'react-select';
require('react-select/dist/react-select.css');

export default class GCSelectField extends GCFormField {
  styles = {
    label: {
      paddingBottom: 10,
      ...BernieText.inputLabel,
    },
  }

  createMenuItems() {
    return Object.keys(this.props.choices).map((choice) => {
      return {
        label: this.props.choices[choice],
        value: choice
      }
    })
  }

  getMenuItemIndex(menuItems) {
    let menuItemIndex = 0;
    menuItems.forEach((item, index) => {
      if (item.value == this.props.value){
        menuItemIndex = index;
      }
    });
    return menuItemIndex
  }

  render() {
    let error = <div></div>;
    let labelStyle = this.styles.label
    if (this.props.errorText) {
      error = <div style={BernieText.inputError}>{this.props.errorText}</div>
      labelStyle = {
        ...labelStyle,
        color: BernieColors.red
      }
    }

    const menuItems = this.createMenuItems();

    return (
      <div style={{
        width: 200,
        ...this.props.style
      }}>
        <div style={labelStyle}>{this.props.label}</div>
        <Select
          labelKey="label"
          value={this.props.value}
          options={menuItems}
          onChange={(element) => {
            if (element)
              this.props.onChange(element.value)
            else
              this.props.onChange(null)
          }}
        />
        {error}
      </div>
    )
  }
}