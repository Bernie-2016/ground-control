import React from 'react';
import {TextField} from 'material-ui';
import {BernieText} from '../styles/bernie-css';

export default class GCPasswordField extends React.Component {
  render() {
    return <TextField
      {...this.props}
      type='password'
      errorStyle={BernieText.inputError}
      hintText={this.props.label}
      onChange={(event) => {this.props.onChange(event.target.value)}}
    />
  }
}