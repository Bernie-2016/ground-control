import React from 'react';
import {DatePicker} from 'material-ui';
import {BernieText} from '../styles/bernie-css';
import moment from 'moment';
import GCFormField from './GCFormField'

export default class GCDateField extends GCFormField {
  render() {
    let oldDate = moment(this.props.value)
      .utcOffset(this.props.utcOffset)
      .toObject()

    let fakedDate = moment(oldDate).toDate()

    return <DatePicker
      value={fakedDate}
      floatingLabelText={this.floatingLabelText()}
      onChange={(_, date) => {
        let newDate = moment(date).toObject()
        newDate['hours'] = oldDate['hours']
        newDate['minutes'] = oldDate['minutes']
        newDate['seconds'] = oldDate['seconds']
        newDate = moment(moment(newDate).toJSON().replace('Z', `${this.props.utcOffset}:00`)).toDate()
        this.props.onChange(newDate)
      }}
    />
  }
}