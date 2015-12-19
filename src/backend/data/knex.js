import knexFactory from 'knex';
import knexfile from './knexfile';

let knex = knexFactory(knexfile[process.env.NODE_ENV])
knex.count = async function(query, col) {
  let results = await query.count(col).first()
  return results.count
}
export default knex;