import React from 'react';
import {Checkbox} from 'material-ui';
import {BernieText, BernieColors} from '../styles/bernie-css'

export default class GCCheckboxesField extends React.Component {
  styles = {
    label: {
      paddingBottom: 10,
      ...BernieText.inputLabel,
    },
  }

  createCheckboxes() {
    let value = this.props.value || []

    return Object.keys(this.props.choices).map((choice) => {
      let selected = false;

      if (value.indexOf(choice) !== -1)
        selected = true;

      return (
        <Checkbox
          key={this.props.choices[choice]}
          label={this.props.choices[choice]}
          checked={selected}
          value={choice}
          onCheck={(event) => {
            let newValue = value.slice()
            if (selected) {
              let index = value.indexOf(choice)
              newValue.splice(index, 1)
            }
            else
              newValue.push(event.target.value)
            this.props.onChange(newValue)
          }}
        />
      )
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

    return (
      <div>
        <div style={labelStyle}>{this.props.label}</div>
        {this.createCheckboxes()}
        {error}
      </div>
    )
  }
}
