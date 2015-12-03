let configOptions = {
  development: {
    url: process.env.DB_CONNECTION_STRING,
    migrationStorageTableName: 'sequelize_meta',
    dialect: 'postgres'
  },
  production: {
    url: process.env.DATABASE_URL,
    migrationStorageTableName: 'sequelize_meta',
    dialect: 'postgres'
  }
}

export default configOptions;