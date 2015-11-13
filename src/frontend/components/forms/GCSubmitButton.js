import React from 'react';
import {TextField} from 'material-ui';
import {RaisedButton} from 'material-ui';

export default class GCSubmitButton extends React.Component {
  render() {
    return <RaisedButton
      primary={true}
      {...this.props}
    />
  }
}