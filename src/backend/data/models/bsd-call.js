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
    sentText: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'sent_text'
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
    updatedAt: 'modified_dt',
    createdAt: 'create_dt',
    tableName: 'bsd_calls',
    indexes: [
      { fields: ['caller_id'] },
      { fields: ['interviewee_id'] },
      { fields: ['call_assignment_id'] },
      { fields: ['reason_not_completed'] },
      { fields: ['call_assignment_id', 'completed'] }
    ],
    classMethods: {
      associate: (models) => {
        BSDCall.belongsTo(models.User, {as: 'caller'})
        BSDCall.belongsTo(models.BSDPerson, {
          as: 'interviewee',
          constraints: false
        })
        BSDCall.belongsTo(models.BSDCallAssignment, {as: 'callAssignment'})
      },
    }
  })
  return BSDCall;
}