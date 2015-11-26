var configOptions = {
  development: {
    use_env_variable: 'DB_CONNECTION_STRING',
    migrationStorageTableName: 'sequelize_meta',
    dialect: 'postgres'
  },
  production: {
    use_env_variable: 'DB_CONNECTION_STRING',
    migrationStorageTableName: 'sequelize_meta',
    dialect: 'postgres'
  }
}

module.exports = configOptions;