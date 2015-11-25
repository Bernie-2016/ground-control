import React from 'react';
import {TextField} from 'material-ui';

export default class GCTextField extends React.Component {
  render() {
    return <TextField
      {...this.props}
      onChange={(event) => {this.props.onChange(event.target.value)}}
    />
  }
}