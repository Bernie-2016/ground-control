import React from 'react';
import {DatePicker} from 'material-ui';
import {BernieText} from '../styles/bernie-css';
import moment from 'moment';
import GCFormField from './GCFormField'

export default class GCDateField extends GCFormField {
  render() {
    let oldDate = moment(this.props.value).utcOffset(this.props.utcOffset);
    return <DatePicker
      {...this.props}
      floatingLabelText={this.floatingLabelText()}
      hintText={this.props.label}
      onChange={(_, date) => {
        let newDate = moment(date).utcOffset(this.props.utcOffset);
        newDate.set('hour', oldDate.get('hour'))
        newDate.set('minute', oldDate.get('minute'))
        newDate.set('second', oldDate.get('second'))
        this.props.onChange(newDate.toDate())
      }}
    />
  }
}