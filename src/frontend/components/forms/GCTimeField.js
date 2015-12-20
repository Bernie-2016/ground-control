import React from 'react';
import {TimePicker} from 'material-ui';
import {BernieText} from '../styles/bernie-css';
import moment from 'moment';

export default class GCTimeField extends React.Component {
  render() {
    let floatingLabelText = this.props.floatingLabelText || this.props.label
    let time = moment(this.props.value).format('HH:mm')
    let oldDate = moment(this.props.value)
    return <TimePicker
      {...this.props}
      floatingLabelText={floatingLabelText}
      value={time}
      hintText={this.props.label}
      onChange={(_, time) => {
        let newDate = moment(time)
        newDate.set('year', oldDate.get('year'))
        newDate.set('month', oldDate.get('month'))
        newDate.set('date', oldDate.get('date'))
        this.props.onChange(newDate.toDate())
      }}
    />
  }
}