import csv from 'csv-load-sync';
import log from '../../../log';
import json2csv from 'json2csv';
import Promise from 'bluebird';
var copyFrom = require('pg-copy-streams').from;
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
  let importPromise = new Promise((resolve, reject) => {
    knex.client.pool.acquire(function(err, client) {
      if (err)
        reject(err)
      function done (err) {
        knex.client.pool.release(client)
        if (err) reject(err)
        else resolve()
      }
      let stream = client.query(copyFrom(`COPY ${table} (${columns.join(',')}) FROM STDIN WITH NULL AS 'null' CSV`))
      let fileStream = fs.createReadStream(filename)
      fileStream.on('error', done)
      fileStream.pipe(stream).on('finish', done).on('error', done)
    })
  })

  await importPromise
  await unlink(filename);
}

export default importData