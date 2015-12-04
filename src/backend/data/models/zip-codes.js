export default function(sequelize, DataTypes) {
  return sequelize.define('ZipCode', {
    zip: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    latitude: DataTypes.DOUBLE,
    longitude: DataTypes.DOUBLE,
    timezoneOffset: {
      type: DataTypes.INTEGER,
      field: 'timezone_offset'
    },
    hasDST: {
      type: DataTypes.BOOLEAN,
      field: 'has_dst'
    }
  }, {
    underscored: true,
    tableName: 'zip_codes',
    indexes: [
      { fields: ['zip'] },
      { fields: ['timezone_offset', 'has_dst']}
    ]
  })
}