export default function(sequelize, DataTypes) {
  let PersonGroup = sequelize.define('PersonGroup', {
  }, {
    underscored: true,
    tableName: 'bsd_cons_groups',
    classMethods: {
      associate: (models) => {
        models.Person.belongsToMany(models.Group, {
          through: PersonGroup,
          foreignKey: 'cons_id'
        });
        models.Group.belongsToMany(models.Person, { through: PersonGroup });
      }
    }
  })
  return PersonGroup;
}