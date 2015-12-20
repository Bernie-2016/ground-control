import React from 'react';
import {TextField} from 'material-ui';
import {BernieText} from '../styles/bernie-css';

export default class GCTextField extends React.Component {
  render() {
    let extraProps = {}
    if (this.props.floatLabel)
      extraProps['floatingLabelText'] = this.props.label
    return <TextField
      {...this.props}
      {...extraProps}
      errorStyle={BernieText.inputError}
      hintText={this.props.label}
      onChange={(event) => {this.props.onChange(event.target.value)}}
    />
  }
}