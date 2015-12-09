import models from './models';
import faker from 'faker';
import csv from 'csv-load-sync';
import log from '../log';

models.sequelize.sync({}).then(() => {
  log.info('Done!');
  process.exit(0)
})