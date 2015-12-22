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

    let extraProps = {
      floatLabel: this.props.label
    }
    if (typeof this.props.floatLabel === false)
      extraProps = {}

    const menuItems = this.createMenuItems();

    return (
      <div style={{
        maxWidth: 200,
        ...this.props.style
      }}>
        <Select
          labelKey="label"
          value={this.props.value}
          options={menuItems}
          onChange={(element) => this.props.onChange(element.value)}
          style={{
            backgroundColor: 'white'
          }}
        />
      </div>
    )
  }
}