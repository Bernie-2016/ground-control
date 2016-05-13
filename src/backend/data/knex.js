import knexFactory from 'knex';
import knexfile from './knexfile';
import log from '../log'

let knex = null;
if (!process.env.NO_DB) {
  knex = knexFactory(knexfile[process.env.NODE_ENV])
  knex.count = async function(query, col) {
    let results = await query.count(col).first()
    return results.count
  }

  knex.bulkInsert = async function(table, values, {transaction}={}) {
    if (values.length < 1)
      return;

    let valueKeys = Object.keys(values[0])
    let columns = `("${valueKeys.join('","')}")`;
    let valueString = values.map((valueObj) => {
      let quotedValues = valueKeys.map((key) => {
        let val = valueObj[key]
        if (typeof val === 'object')
          val = val.toISOString()
        else
          val = val.toString()
        val = val.replace('\'', '\'\'')
        return `'${val}'`
      })
      return `(${quotedValues.join(',')})`
    }).join(', ')
    let statement = `INSERT INTO "${table}" ${columns} VALUES ${valueString}`

    let query = knex.raw(statement)
    if (transaction)
      query = query.transacting(transaction)
    return query
  }

  knex.insertAndFetch = async function(table, values, {idField, transaction}={}) {
    let timestamp = new Date()
    if (!values.length)
      values = [values]
    values = values.map((val) => {
      return {
        // modified_dt: timestamp,
        // create_dt: timestamp,
        ...val
      }
    })
    idField = idField || 'id'
    let query = knex(table).insert(values).returning(idField);
    log.debug(query.toString())
    if (transaction) {
      query = query.transacting(transaction)
      log.debug(query.toString())
    }
    let ids = await query

    query = knex(table).whereIn(idField, ids)
    if (transaction)
      query = query.transacting(transaction)

    let returnedObjects = await query
    if (returnedObjects.length === 1)
      return returnedObjects[0]
    return returnedObjects
  }
}
export default knex;