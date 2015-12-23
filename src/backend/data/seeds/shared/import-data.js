import csv from 'csv-load-sync';
import log from '../../../log';
import json2csv from 'json2csv';
import Promise from 'bluebird';
import fs from 'fs';

const toCSV = Promise.promisify(json2csv);
const writeFile = Promise.promisify(fs.writeFile)
const unlink = Promise.promisify(fs.unlink)

async function importData(knex, table, data) {
  log.info(`Importing ${table}...`)
  let columns = Object.keys(data[0]);
  let csvData = await toCSV({data: data})
  let filename = `${table}.csv`
  let path = `${process.cwd()}/${filename}`;
  csvData = csvData.split('\n').slice(1).join('\n')
  csvData = csvData.replace(/\"null\"/g, "null")
  await writeFile(filename, csvData);
  await knex.raw(`\copy ${table} (${columns.join(',')}) FROM '${path}' WITH NULL AS 'null' CSV`)
  await unlink(filename);
}

export default importData