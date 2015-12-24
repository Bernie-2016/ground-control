import React from 'react';
import {BernieTheme} from './styles/bernie-theme';
import {BernieColors, BernieText} from './styles/bernie-css';

export default class Unauthorized extends React.Component {
  render() {
    return (
      <div>
        You don't have access to that.
      </div>
    )
  }
}