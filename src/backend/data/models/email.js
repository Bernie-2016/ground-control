export default function(sequelize, DataTypes) {
  let Email = sequelize.define('Email', {
    id: {
      type: DataTypes.BIGINT,
      field: 'cons_email_id',
      primaryKey: true
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      field: 'is_primary'
    },
    address: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: true,
        isLowercase: true
      }
    },
  }, {
    updatedAt: 'modified_dt',
    createdAt: 'create_dt',
    underscored: true,
    tableName: 'emails',
  })
  return Email;
}