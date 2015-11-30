export default function(sequelize, DataTypes) {
  let BSDPersonGroup = sequelize.define('BSDPersonGroup', {
  }, {
    underscored: true,
    tableName: 'bsd_cons_groups',
    classMethods: {
      associate: (models) => {
        models.BSDPerson.belongsToMany(models.BSDGroup, {
          through: BSDPersonGroup,
          foreignKey: 'cons_id'
        });
        models.BSDGroup.belongsToMany(models.BSDPerson, { through: BSDPersonGroup });
      }
    }
  })
  return BSDPersonGroup;
}