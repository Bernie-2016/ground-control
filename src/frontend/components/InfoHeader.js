import React from 'react';
import {BernieText} from './styles/bernie-css';
export default function({content}) {
  return (
    <h3 style={BernieText.smallHeader}>{content}</h3>
  );
}