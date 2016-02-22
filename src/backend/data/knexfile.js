if (typeof process.env.DATABASE_URL === 'undefined' && !process.env.NO_DB)
  require('dotenv').load({path: '../../../.env'});
require("babel/register");
var sharedConfig = {
  connection: process.env.DATABASE_URL,
  client: 'pg',
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations'
  },
  'debug': true
}

var development = {
  seeds: {
    directory: './seeds/development'
  }
};

var production = {
  seeds: {
    directory: './seeds/production'
  },
};

Object.assign(development, sharedConfig);
Object.assign(production, sharedConfig);

module.exports = {
  development: development,
  production: production
}