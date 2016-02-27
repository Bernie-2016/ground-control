import knex from '../src/backend/data/knex'
import bsdClient from '../src/backend/bsd-instance'
import fs from 'fs'
import Baby from 'babyparse';

async function main() {
  let filePath = process.argv[4]
  let groupId = process.argv[3]
  let rawData = fs.readFileSync(filePath, 'utf8').trim()
  let parsedData = Baby.parse(rawData, {header: true}).data
  let data = []
  let now = new Date()
  parsedData.forEach((datum) => {
    data.push({
      cons_group_id: groupId,
      cons_id: datum['Unique Constituent ID']
    })
  })
  await knex.transaction(async (trx) => {
    await knex('bsd_person_bsd_groups')
      .where('cons_group_id', groupId)
      .delete()
      .transacting(trx)
    await knex.bulkInsert('bsd_person_bsd_groups', data, {transaction: trx})
  })
}

main()
  .then(() => { console.log('Done!') })
  .catch((ex) => { console.log(ex) })