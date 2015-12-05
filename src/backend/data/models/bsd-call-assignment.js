export default function(sequelize, DataTypes) {
  let BSDCallAssignment = sequelize.define('BSDCallAssignment', {
    name: DataTypes.STRING
  }, {
    underscored: true,
    tableName: 'bsd_call_assignments',
    classMethods: {
      associate: (models) => {
        BSDCallAssignment.belongsTo(models.BSDSurvey, {
          foreignKey: 'signup_form_id',
          constraints: false,
          as: 'survey'
        })
        BSDCallAssignment.belongsTo(models.BSDGroup, {
          as: 'intervieweeGroup',
          foreignKey: 'cons_group_id',
          constraints: false,
        });
        BSDCallAssignment.hasMany(models.BSDAssignedCall, {
          as: 'assignedCalls',
          foreignKey: 'call_assignment_id'
        })
      }
    }
  })
  return BSDCallAssignment;
}