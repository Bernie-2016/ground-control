import React from 'react';
import Relay from 'react-relay';
import SideBarLayout from './SideBarLayout.js'
import GCSelectField from './forms/GCSelectField.js'
import GCTextField from './forms/GCTextField.js'
import GCMUISelectField from './forms/GCMUISelectField.js'
import moment from 'moment'
import {Paper} from 'material-ui'
import {BernieText} from './styles/bernie-css'

export default class DummyEventCreate extends React.Component {
  render() {
    window.location.reload();
    return <div></div>
  }
}