import React from 'react';
import {TextField} from 'material-ui';
import {BernieText} from '../styles/bernie-css';

export default class GCTextField extends React.Component {
  render() {
    return <TextField
      {...this.props}
      errorStyle={BernieText.inputError}
      hintText={this.props.label}
      onChange={(event) => {this.props.onChange(event.target.value)}}
    />
  }
}