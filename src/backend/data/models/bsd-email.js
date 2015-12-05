export default function(sequelize, DataTypes) {
  return sequelize.define('BSDEmail', {
    id: {
      type: DataTypes.BIGINT,
      field: 'cons_email_id',
      primaryKey: true
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      field: 'is_primary'
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
        isLowercase: true
      }
    },
  }, {
    updatedAt: 'modified_dt',
    createdAt: 'create_dt',
    underscored: true,
    tableName: 'bsd_emails',
  })
}