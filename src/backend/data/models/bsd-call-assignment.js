export default function(sequelize, DataTypes) {
  let BSDCallAssignment = sequelize.define('BSDCallAssignment', {
    name: DataTypes.STRING
  }, {
    underscored: true,
    tableName: 'bsd_call_assignments',
    classMethods: {
      associate: (models) => {
        BSDCallAssignment.belongsTo(models.BSDSurvey, {foreignKey: 'signup_form_id', as: 'survey'})
        BSDCallAssignment.belongsTo(models.BSDGroup, {as: 'intervieweeGroup'});
        BSDCallAssignment.belongsTo(models.BSDGroup, {as: 'callerGroup'});
        BSDCallAssignment.hasMany(models.BSDAssignedCall, {
          as: 'assignedCalls',
          foreignKey: {
            name: 'call_assignment_id'
          }
        })
      }
    }
  })
  return BSDCallAssignment;
}