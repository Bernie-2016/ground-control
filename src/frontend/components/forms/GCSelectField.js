import React from 'react';
import {FlatButton, SelectField} from 'material-ui';
import {BernieText, BernieColors} from '../styles/bernie-css'

export default class GCSelectField extends React.Component {
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

  render() {
    let valueKey = this.props.value;
    let valueObj = {
      name: this.props.choices[valueKey],
      value: valueKey
    }
    console.log(valueObj)
    return (
      <div>
        <div style={this.styles.label}>{this.props.label}</div>
        <SelectField
          {...this.props}
          value={valueObj}
          displayMember='name'
          valueMember='value'
          menuItems={this.createMenuItems()}
        />
      </div>
    )
  }
}