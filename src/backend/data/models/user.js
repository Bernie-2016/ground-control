export default function(sequelize, DataTypes) {
  return sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: true,
        isLowercase: true
      }
    },
    password: DataTypes.STRING
  }, {
    underscored: true,
    tableName: 'users',
  })
}