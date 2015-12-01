export default function(sequelize, DataTypes) {
  let BSDCall = sequelize.define('BSDCall', {
    completed: DataTypes.BOOLEAN,
    leftVoicemail: DataTypes.BOOLEAN,
  }, {
    underscored: true,
    tableName: 'calls',
    classMethods: {
      associate: (models) => {
        BSDCall.belongsTo(models.BSDPerson, {as: 'caller'})
        BSDCall.belongsTo(models.BSDPerson, {as: 'interviewee'});
      }
    }
  })
  return BSDCall;
}