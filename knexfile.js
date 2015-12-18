module.exports = {
  connection: process.env.DATABASE_URL,
  client: 'pg',
  migrations: {
    tableName: 'knex_migrations'
  }
}
