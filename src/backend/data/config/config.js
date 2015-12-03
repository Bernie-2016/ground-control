let config = {
  url: process.env.DATABASE_URL,
  migrationStorageTableName: 'sequelize_meta',
  dialect: 'postgres'
}
let configOptions = {
  development: config,
  production: config
}

export default configOptions;