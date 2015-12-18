import knexFactory from 'knex';
import knexfile from './knexfile';

const knex = knexFactory(knexfile)
export default knex;