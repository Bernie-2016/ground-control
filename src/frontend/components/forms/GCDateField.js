import React from 'react';
import {DatePicker} from 'material-ui';
import {BernieText} from '../styles/bernie-css';
import moment from 'moment';

export default class GCDateField extends React.Component {
  render() {
    console.log(this.props.value, typeof this.props.value);
    let oldDate = moment(this.props.value);
    return <DatePicker
      {...this.props}
      hintText={this.props.label}
      onChange={(_, date) => {
        let newDate = moment(date);
        newDate.set('hour', oldDate.get('hour'))
        newDate.set('minute', oldDate.get('minute'))
        newDate.set('second', oldDate.get('second'))
        this.props.onChange(newDate.toDate())
      }}
    />
  }
}