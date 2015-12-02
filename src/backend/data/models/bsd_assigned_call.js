export default function(sequelize, DataTypes) {
  let BSDAssignedCall = sequelize.define('BSDAssignedCall', {

  }, {
    underscored: true,
    tableName: 'calls',
    classMethods: {
      associate: (models) => {
        BSDCall.belongsTo(models.User,
          {
            as: 'caller',
            foreignKey: {
              name: 'caller_id',
              uniqe: true
            }
          })
        BSDCall.belongsTo(models.BSDPerson,
          {
            as: 'interviewee',
            foreignKey: {
              name: 'interviewee_id',
              unique: true
            }
          })
        BSDCall.belongsTo(models.BSDCallAssignment, {as: 'callAssignment'})
      }
    }
  })
  return BSDCall;
}