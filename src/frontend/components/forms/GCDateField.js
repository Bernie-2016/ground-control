import React from 'react';
import {DatePicker} from 'material-ui';
import {BernieText} from '../styles/bernie-css';
import moment from 'moment';
import GCFormField from './GCFormField'

export default class GCDateField extends GCFormField {
  render() {
<<<<<<< Updated upstream
    let oldDate = moment(this.props.value)
      .utcOffset(this.props.utcOffset)
      .toObject()

=======
    let oldDate = moment(this.props.value).utcOffset(this.props.utcOffset).toObject()
>>>>>>> Stashed changes
    let fakedDate = moment(oldDate).toDate()

    return <DatePicker
      value={fakedDate}
      floatingLabelText={this.floatingLabelText()}
      onChange={(_, date) => {
        let newDate = moment(date).toObject()
        newDate['hours'] = oldDate['hours']
        newDate['minutes'] = oldDate['minutes']
        newDate['seconds'] = oldDate['seconds']
<<<<<<< Updated upstream
        newDate = moment(moment(newDate).toJSON().replace('Z', `${this.props.utcOffset}:00`)).toDate()
=======
        newDate.set('hour', oldDate.get('hour'))
        newDate.set('minute', oldDate.get('minute'))
        newDate.set('second', oldDate.get('second'))
>>>>>>> Stashed changes
        this.props.onChange(newDate)
      }}
    />
  }
}