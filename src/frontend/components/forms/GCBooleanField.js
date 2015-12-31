import React from 'react';
import {FlatButton} from 'material-ui';
import {BernieText, BernieColors} from '../styles/bernie-css'

export default class GCBooleanField extends React.Component {
  styles = {
    label: {
      ...BernieText.inputLabel
    },
    button: {
      border: '1px solid ' + BernieColors.lightBlue,
      marginRight: 5
    },
    selectedButton: {
      color: BernieColors.lightBlue,
      backgroundColor: BernieColors.blue,
      marginRight: 5
    },
  }
  render() {
    let error = <div></div>
    let labelStyle = this.styles.label;
    let value = this.props.value;

    if (this.props.labelStyle)
      labelStyle = this.props.labelStyle;
    if (this.props.errorText) {
      labelStyle = {
        ...labelStyle,
        color: BernieColors.red
      }
      error = <div style={BernieText.inputError}>{this.props.errorText}</div>
    }

    let yesButton = (
      <FlatButton
        label="Yes"
        secondary={true}
        style={this.styles.button}
        onTouchTap={(event) => {this.props.onChange(true)}}
      />
    )
    let noButton = (
      <FlatButton
        label="No"
        secondary={true}
        style={this.styles.button}
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
      <div>
        <div style={labelStyle}>
          {this.props.label}
        </div>
        <div style={{marginTop: 10}}>
          {yesButton}
          {noButton}
        </div>
        {error}
      </div>
    )
  }
}