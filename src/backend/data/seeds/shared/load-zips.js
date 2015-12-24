import csv from 'csv-load-sync';
import log from '../../../log';

function loadZips(file) {
  let zipCodes = csv(file)
  let timestamp = new Date()

  zipCodes.forEach((datum) => {
    datum.timezone_offset = parseInt(datum.timezone_offset, 10)
    datum.latitude = parseFloat(datum.latitude)
    datum.longitude = parseFloat(datum.longitude)
    datum.has_dst = datum.has_dst == '1' ? true : false
    datum.create_dt = timestamp
    datum.modified_dt = timestamp
  })
  return zipCodes
}

export default loadZips