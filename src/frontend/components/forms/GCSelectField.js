import React from 'react';
import {FlatButton, SelectField} from 'material-ui';
import {BernieText, BernieColors} from '../styles/bernie-css'
import GCFormField from './GCFormField';

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
        name: this.props.choices[choice],
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

    const menuItems = this.createMenuItems();

    return (
    <SelectField
      // {...this.props}
      value={this.props.value}
      displayMember='name'
      valueMember='value'
      floatingLabelText={this.floatingLabelText()}
      errorStyle={BernieText.inputError}
      menuItems={menuItems}
      selectedIndex={this.getMenuItemIndex(menuItems)}
      onChange={(event) => {this.props.onChange(event.target.value)}}
    />
    )
  }
}