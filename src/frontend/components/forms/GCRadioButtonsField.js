import React from 'react';
import {FlatButton, RadioButtonGroup, RadioButton} from 'material-ui';
import {BernieText, BernieColors} from '../styles/bernie-css'

export default class GCRadioButtonsField extends React.Component {
  styles = {
    label: {
      paddingBottom: 10,
      ...BernieText.inputLabel,
    },
  }

  renderChoices() {
    return Object.keys(this.props.choices).map((choice) => {
      let label = this.props.choices[choice]
      return (
        <RadioButton
          value={choice}
          label={label}
          style={{
            ...BernieText.default,
            fontSize: '1em'
          }}
        />
      )
    })
  }
  render() {
    return (
      <div>
        <div style={this.styles.label}>{this.props.label}</div>
        <RadioButtonGroup name={this.props.name}>
          {this.renderChoices()}
        </RadioButtonGroup>
      </div>
    )
  }
}