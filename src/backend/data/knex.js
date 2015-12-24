import knexFactory from 'knex';
import knexfile from './knexfile';

let knex = null;
if (!process.env.NO_DB) {
  knex = knexFactory(knexfile[process.env.NODE_ENV])
  knex.count = async function(query, col) {
    let results = await query.count(col).first()
    return results.count
  }

  knex.insertAndFetch = async function(table, values, {idField, transaction}={}) {
    let timestamp = new Date()
    if (!values.length)
      values = [values]
    values = values.map((val) => {
      return {
        modified_dt: timestamp,
        create_dt: timestamp,
        ...val
      }
    })
    idField = idField || 'id'
    let query = knex(table).insert(values).returning(idField);
    if (transaction)
      query = query.transacting(transaction)
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