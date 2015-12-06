export default function(sequelize, DataTypes) {
  return sequelize.define('BSDEmail', {
    id: {
      type: DataTypes.INTEGER,
      field: 'cons_email_id',
      primaryKey: true
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      field: 'is_primary'
    },
    email: DataTypes.STRING,
  }, {
    updatedAt: 'modified_dt',
    createdAt: 'create_dt',
    underscored: true,
    tableName: 'bsd_emails',
  })
}