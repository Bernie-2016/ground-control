export default function(sequelize, DataTypes) {
  let CallAssignment = sequelize.define('CallAssignment', {
    name: DataTypes.STRING
  }, {
    underscored: true,
    tableName: 'call_assignments',
    classMethods: {
      associate: (models) => {
        CallAssignment.belongsTo(models.Survey)
        CallAssignment.belongsTo(models.Group, {as: 'targetGroup'});
        CallAssignment.belongsTo(models.Group, {as: 'callerGroup'});
      }
    }
  })
  return CallAssignment;
}