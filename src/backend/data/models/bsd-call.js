export default function(sequelize, DataTypes) {
  let BSDCall = sequelize.define('BSDCall', {
    completed: DataTypes.BOOLEAN,
    attemptedAt: {
      type: DataTypes.DATE,
      field: 'attempted_at'
    },
    leftVoicemail: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'left_voicemail'
    },
    reasonNotCompleted: {
      type: DataTypes.STRING,
      field: 'reason_not_completed',
      allowNull: true,
      validate: {
        isIn: [['NO_PICKUP', 'CALL_BACK', 'NOT_INTERESTED', 'OTHER_LANGUAGE', 'WRONG_NUMBER', 'DISCONNECTED_NUMBER']]
      }
    }
  }, {
    underscored: true,
    tableName: 'bsd_calls',
    classMethods: {
      associate: (models) => {
        BSDCall.belongsTo(models.User, {as: 'caller'})
        BSDCall.belongsTo(models.BSDPerson, {
          as: 'interviewee',
          constraints: false
        })
        BSDCall.belongsTo(models.BSDCallAssignment, {as: 'callAssignment'})
      }
    }
  })
  return BSDCall;
}