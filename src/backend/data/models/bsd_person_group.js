export default function(sequelize, DataTypes) {
  let BSDPersonGroup = sequelize.define('BSDPersonGroup', {
  }, {
    underscored: true,
    updatedAt: 'modified_dt',
    createdAt: 'create_dt',
    tableName: 'bsd_cons__cons_group',
    classMethods: {
      associate: (models) => {
        models.BSDPerson.belongsToMany(models.BSDGroup, {
          through: BSDPersonGroup,
          foreignKey: 'cons_id',
          as: 'people'
        });
        models.BSDGroup.belongsToMany(models.BSDPerson, {
          through: BSDPersonGroup,
          foreignKey: 'cons_group_id',
          as: 'groups'
        });
      }
    }
  })
  return BSDPersonGroup;
}