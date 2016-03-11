import React from 'react';
import {DatePicker} from 'material-ui';
import {BernieText} from '../styles/bernie-css';
import moment from 'moment';
import GCFormField from './GCFormField'

export default class GCDateField extends GCFormField {
  render() {
    let fakeDate = moment(this.props.value)
      .add(this.props.utcOffset - moment().utcOffset(), 'minutes')
      .toDate()
    let oldDate = moment(fakeDate).toObject()

    return <DatePicker
      value={fakeDate}
      floatingLabelText={this.floatingLabelText()}
      onChange={(_, date) => {
        let newDate = moment(date).toObject()
        newDate['hours'] = oldDate['hours']
        newDate['minutes'] = oldDate['minutes']
        newDate['seconds'] = oldDate['seconds']
        newDate = moment(newDate)
          .add(moment().utcOffset() - this.props.utcOffset, 'minutes')
        this.props.onChange(newDate.toDate())
      }}
    />
  }
}