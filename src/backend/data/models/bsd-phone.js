export default function(sequelize, DataTypes) {
  return sequelize.define('BSDPhone', {
    id: {
      type: DataTypes.INTEGER,
      field: 'cons_phone_id',
      primaryKey: true
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      field: 'is_primary'
    },
    phone: DataTypes.STRING,
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