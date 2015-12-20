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
    return (
      <SelectField
        {...this.props}
        {...extraProps}
        displayMember='name'
        valueMember='value'
        floatingLabelText={this.props.label}
        errorStyle={BernieText.inputError}
        menuItems={this.createMenuItems()}
        onChange={(event) => {this.props.onChange(event.target.value)}}
      />
    )
  }
}