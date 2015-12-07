import models from './models';
import csv from 'csv-load-sync';
import log from '../log';

let zips = csv('./src/backend/data/zip-codes.csv')
zips.forEach((datum) => {
  datum.timezoneOffset = parseInt(datum.timezoneOffset, 10)
  datum.latitude = parseFloat(datum.latitude)
  datum.longitude = parseFloat(datum.longitude)
  datum.hasDST = datum.hasDST == '1' ? true : false
})
models.ZipCode.bulkCreate(zips).then(() => {
  log.info('Done!');
  return;
})