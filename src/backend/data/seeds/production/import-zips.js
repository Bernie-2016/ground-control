import loadZips from '../shared/load-zips'
import importData from '../../import-data'
import log from '../../../log'
import knexExtensions from '../../knex'

exports.seed = async function(knex, Promise) {
  let zipCodes = loadZips('./seeds/shared/zip-codes.csv')
  await knexExtensions.transaction(async(trx) => {
    log.info('Deleting existing zip codes...')
    await knexExtensions('zip_codes').del().transacting(trx)
    log.info('Inserting zip codes...')
    await knexExtensions.bulkInsert('zip_codes', zipCodes, {transaction: trx})
  })
};
