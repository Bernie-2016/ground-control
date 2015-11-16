import React from 'react';
import {FlatButton} from 'material-ui';
import {BernieText, BernieColors} from '../styles/bernie-css'

export default class GCBooleanField extends React.Component {
  styles = {
    label: {
      paddingLeft: 10,
      ...BernieText.inputLabel,
    }
  }
  render() {
    let labelStyle = this.styles.label;
    if (this.props.labelStyle)
      labelStyle = this.props.labelStyle;

    return (
      <span>
        <FlatButton
          label="Yes"
          secondary={true}
        />
        <FlatButton
          label="No"
          secondary={true}
        />
        <span style={labelStyle}>
          {this.props.label}
        </span>
      </span>
    )
  }
}