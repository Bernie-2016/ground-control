export default function(sequelize, DataTypes) {
  let CallAssignment = sequelize.define('CallAssignment', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoincrement: true
    },
    name: DataTypes.STRING
  }, {
    underscored: true,
    tableName: 'call_assignments',
  })
  return CallAssignment;
}