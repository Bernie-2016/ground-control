import React from 'react';
import {TimePicker} from 'material-ui';
import {BernieText} from '../styles/bernie-css';
import moment from 'moment';
import GCFormField from './GCFormField';

export default class GCTimeField extends GCFormField {
  render() {
    console.log(this.props.value)
    let time = moment(this.props.value).utcOffset(this.props.utcOffset).toDate()
    let oldDate = moment(this.props.value).utcOffset(this.props.utcOffset)
    return <TimePicker
      {...this.props}
      floatingLabelText={this.floatingLabelText()}
      value={time}
      hintText={this.props.label}
      onChange={(_, time) => {
        console.log(time);
        let newDate = moment(time)
        newDate.set('year', oldDate.get('year'))
        newDate.set('month', oldDate.get('month'))
        newDate.set('date', oldDate.get('date'))
        this.props.onChange(newDate.toDate())
      }}
    />
  }
}