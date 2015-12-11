export default function(sequelize, DataTypes) {
  let BSDCallAssignment = sequelize.define('BSDCallAssignment', {
    name: DataTypes.STRING
  }, {
    underscored: true,
    updatedAt: 'modified_dt',
    createdAt: 'create_dt',
    tableName: 'bsd_call_assignments',
    indexes: [
      { fields: ['gc_bsd_survey_id'] },
      { fields: ['gc_bsd_group_id'] },
    ],
    classMethods: {
      associate: (models) => {
        BSDCallAssignment.belongsTo(models.GCBSDSurvey, {
          foreignKey: 'gc_bsd_survey_id',
          constraints: false,
          as: 'survey'
        })
        BSDCallAssignment.belongsTo(models.GCBSDGroup, {
          as: 'intervieweeGroup',
          foreignKey: 'gc_bsd_group_id',
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