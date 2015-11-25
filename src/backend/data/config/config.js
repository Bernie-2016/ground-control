let configOptions = {
  'development': {
    'use_env_variable': 'DB_CONNECTION_STRING',
    'migrationStorageTableName': 'sequelize_meta'
  },
  'production': {
    'use_env_variable': 'DB_CONNECTION_STRING',
    'migrationStorageTableName': 'sequelize_meta'
  }
}

export default configOptions;