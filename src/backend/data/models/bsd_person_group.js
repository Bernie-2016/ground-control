export default function(sequelize, DataTypes) {
  let BSDPersonGroup = sequelize.define('BSDPersonGroup', {
  }, {
    underscored: true,
    tableName: 'bsd_cons_groups',
    classMethods: {
      associate: (models) => {
        models.BSDPerson.belongsToMany(models.Group, {
          through: BSDPersonGroup,
          foreignKey: 'cons_id'
        });
        models.BSDGroup.belongsToMany(models.Person, { through: BSDPersonGroup });
      }
    }
  })
  return BSDPersonGroup;
}