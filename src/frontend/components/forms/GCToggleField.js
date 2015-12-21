import React from 'react';
import {Toggle} from 'material-ui';
import {BernieText, BernieColors} from '../styles/bernie-css'

export default class GCToggleField extends React.Component {
  styles = {
    label: {
      ...BernieText.inputLabel
    },
    selectedButton: {
      color: BernieColors.lightBlue,
      backgroundColor: BernieColors.blue
    },
  }
  render() {
    return <Toggle
      {...this.props}
    />
  }
}