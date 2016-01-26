import React from 'react';
import Relay from 'react-relay';
import {Styles} from 'material-ui';
import TopNav from './TopNav';
import {BernieTheme} from './styles/bernie-theme';
import {BernieColors} from './styles/bernie-css';
import {CircularProgress} from 'material-ui';

export default class Loading extends React.Component {
  render() {
    return (
      <div style={{
        paddingTop: 50,
        margin: '0 auto'
      }}>
        <CircularProgress mode="indeterminate" size={2}/>
      </div>
    )
  }
}