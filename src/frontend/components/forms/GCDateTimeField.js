import React from 'react';
import {BernieText} from '../styles/bernie-css';
import moment from 'moment';
import GCFormField from './GCFormField';
import Kronos from 'react-kronos'

export default class GCDateTimeField extends GCFormField {

  convertToTimezone(date, utcOffset) {
    return moment(moment(date).utcOffset(utcOffset).format("YYYY-MM-DD HH:mm:ss"))
  }

  convertFromTimezone(date, utcOffset) {
    let offsetDiff = date.utcOffset() - (moment.parseZone(utcOffset).utcOffset() - date.utcOffset())
    return this.convertToTimezone(date, offsetDiff)
  }

  render() {
    let convertedDateTime = this.convertToTimezone(this.props.value, this.props.utcOffset)
    return (
      <div>
        <div style={{marginBottom: 5}}>
          <Kronos
            {...this.props}
            date={convertedDateTime}
            onChange={(newDate) => {
              this.props.onChange(this.convertFromTimezone(newDate, this.props.utcOffset).toDate())
            }}
          />
        </div>
        <div>
          <Kronos
            {...this.props}
            time={convertedDateTime}
            onChange={(newDate) => {
              this.props.onChange(this.convertFromTimezone(newDate, this.props.utcOffset).toDate())
            }}
          />
        </div>
      </div>
    )
  }
}