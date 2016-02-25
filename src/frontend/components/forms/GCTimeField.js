import React from 'react';
import {TimePicker} from 'material-ui';
import {BernieText} from '../styles/bernie-css';
import moment from 'moment';
import GCFormField from './GCFormField';

export default class GCTimeField extends GCFormField {
  render() {
    let oldDate = moment(this.props.value)
      .utcOffset(this.props.utcOffset)
      .toObject()

    let fakedDate = moment(oldDate).toDate()
    return <TimePicker
      {...this.props}
      floatingLabelText={this.floatingLabelText()}
      value={fakedDate}
      hintText={this.props.label}
      onChange={(_, time) => {
        let newTime = moment(time).toObject()
        newTime['years'] = oldDate['years']
        newTime['months'] = oldDate['months']
        newTime['date'] = oldDate['date']
        newTime = moment(moment(newTime).toJSON().replace('Z', `${this.props.utcOffset}:00`)).toDate()
        this.props.onChange(newTime.toDate())
      }}
    />
  }
}