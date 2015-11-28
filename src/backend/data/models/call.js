export default function(sequelize, DataTypes) {
  let Call = sequelize.define('Call', {
    completed: DataTypes.BOOLEAN,
    leftVoicemail: DataTypes.BOOLEAN,
  }, {
    underscored: true,
    tableName: 'calls',
    classMethods: {
      associate: (models) => {
        Call.belongsTo(models.Person, {as: 'caller'})
        Call.belongsTo(models.Person, {as: 'interviewee'});
      }
    }
  })
  return Call;
}