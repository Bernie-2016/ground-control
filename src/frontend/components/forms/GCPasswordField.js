import React from 'react';
import {TextField} from 'material-ui';
import {BernieText} from '../styles/bernie-css';

export default class GCPasswordField extends React.Component {
  render() {
    let extraProps = {
      floatLabel: this.props.label
    }
    if (typeof this.props.floatLabel === false)
      extraProps = {}
    return <TextField
      {...this.props}
      {...extraProps}
      type='password'
      errorStyle={BernieText.inputError}
      hintText={this.props.label}
      onChange={(event) => {this.props.onChange(event.target.value)}}
    />
  }
}