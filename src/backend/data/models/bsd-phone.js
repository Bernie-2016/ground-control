export default function(sequelize, DataTypes) {
  return sequelize.define('BSDPhone', {
    id: {
      type: DataTypes.BIGINT,
      field: 'cons_phone_id',
      primaryKey: true
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      field: 'is_primary'
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        isNumeric: true
      }
    },
    textOptOut: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'isunsub'
    },
  }, {
    updatedAt: 'modified_dt',
    createdAt: 'create_dt',
    underscored: true,
    tableName: 'bsd_phones',
  })
}