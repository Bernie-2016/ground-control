require('dotenv').load({path: '../../../.env'});
module.exports = {
  connection: process.env.DATABASE_URL,
  client: 'pg',
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations'
  },
}
