export default function(sequelize, DataTypes) {
  let BSDCallAssignment = sequelize.define('BSDCallAssignment', {
    name: DataTypes.STRING
  }, {
    underscored: true,
    tableName: 'call_assignments',
    classMethods: {
      associate: (models) => {
        BSDCallAssignment.belongsTo(models.BSDSurvey, {foreignKey: 'bsd_survey_id', as: 'survey'})
        BSDCallAssignment.belongsTo(models.BSDGroup, {as: 'targetGroup'});
        BSDCallAssignment.belongsTo(models.BSDGroup, {as: 'callerGroup'});
      }
    }
  })
  return BSDCallAssignment;
}