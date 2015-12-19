import knexFactory from 'knex';
import knexfile from './knexfile';

let knex = knexFactory(knexfile[process.env.NODE_ENV])
knex.wrap = async function(knexQB) {
  let table = knexQB._single.table
  let results = await knexQB;
  if (results && results.length)
    results = results.map((result) => {
      result._type = table;
      return result
    })
  else
    results._type = table;
  return results
}
export default knex;