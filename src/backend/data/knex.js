import knexFactory from 'knex';
import knexfile from './knexfile';

let knex = knexFactory(knexfile[process.env.NODE_ENV])
export default knex;