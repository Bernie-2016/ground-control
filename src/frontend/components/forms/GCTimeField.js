import React from 'react';
import {TimePicker} from 'material-ui';
import {BernieText} from '../styles/bernie-css';
import moment from 'moment';
import GCFormField from './GCFormField';

export default class GCTimeField extends GCFormField {

  render() {
    let fakeDate = moment(this.props.value)
      .add(this.props.utcOffset - moment().utcOffset(), 'minutes')
      .toDate()

    return <TimePicker
      floatingLabelText={this.floatingLabelText()}
      value={fakeDate}
      onChange={(_, time) => {
        let newDate = moment(time)
          .add(moment().utcOffset() - this.props.utcOffset, 'minutes')
          .toDate()
        this.props.onChange(newDate)
      }}
    />
  }
}