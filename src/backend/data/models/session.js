export default function(sequelize, DataTypes) {
  let Session = sequelize.define('Session', {
    sid: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    data: DataTypes.TEXT
  }, {
    underscored: true,
    tableName: 'sessions',
  })
  return Session;
}