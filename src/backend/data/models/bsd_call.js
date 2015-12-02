export default function(sequelize, DataTypes) {
  let BSDCall = sequelize.define('BSDCall', {
    completed: DataTypes.BOOLEAN,
    attemptedAt: DataTypes.DATE,
    leftVoicemail: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    reasonNotCompleted: {
      type: DataTypes.STRING,
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
        BSDCall.belongsTo(models.BSDPerson, {as: 'interviewee'})
        BSDCall.belongsTo(models.BSDCallAssignment, {as: 'callAssignment'})
      }
    }
  })
  return BSDCall;
}