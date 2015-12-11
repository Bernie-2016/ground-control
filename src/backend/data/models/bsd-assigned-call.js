export default function(sequelize, DataTypes) {
  let BSDAssignedCall = sequelize.define('BSDAssignedCall', {

  }, {
    underscored: true,
    updatedAt: 'modified_dt',
    createdAt: 'create_dt',
    tableName: 'bsd_assigned_calls',
    indexes: [
      { fields: ['caller_id'] },
      { fields: ['interviewee_id'] },
      { fields: ['call_assignment_id'] },
    ],
    classMethods: {
      associate: (models) => {
        BSDAssignedCall.belongsTo(models.User,
          {
            as: 'caller',
            foreignKey: 'caller_id',
          })
        BSDAssignedCall.belongsTo(models.BSDPerson,
          {
            as: 'interviewee',
            constraints: false,
            foreignKey: 'interviewee_id',
          })
        BSDAssignedCall.belongsTo(models.BSDCallAssignment, {as: 'callAssignment'})
      }
    }
  })
  return BSDAssignedCall;
}