import React from 'react';
import {FlatButton} from 'material-ui';
import {BernieText, BernieColors} from '../styles/bernie-css'

export default class GCBooleanField extends React.Component {
  styles = {
    label: {
      paddingLeft: 10,
      ...BernieText.inputLabel,
    },
    selectedButton: {
      color: BernieColors.lightBlue,
      backgroundColor: BernieColors.blue
    }
  }
  render() {

    let labelStyle = this.styles.label;
    let value = this.props.value;

    if (this.props.labelStyle)
      labelStyle = this.props.labelStyle;

    let yesButton = (
      <FlatButton
        label="Yes"
        secondary={true}
        onTouchTap={(event) => {this.props.onChange(true)}}
      />
    )
    let noButton = (
      <FlatButton
        label="No"
        secondary={true}
        onTouchTap={(event) => {this.props.onChange(false)}}
      />
    )
    if (value === true) {
      yesButton = React.cloneElement(yesButton, {
        style: this.styles.selectedButton
      })
    }

    else if (value === false) {
      noButton = React.cloneElement(noButton, {
        style: this.styles.selectedButton
      })
    }

    return (
      <span>
        {yesButton}
        {noButton}
        <span style={labelStyle}>
          {this.props.label}
        </span>
      </span>
    )
  }
}