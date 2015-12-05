var config = {
  url: process.env.DATABASE_URL,
  migrationStorageTableName: 'sequelize_meta',
  dialect: 'postgres'
}
var configOptions = {
  development: config,
  production: config
}

module.exports=configOptions;