export default function(sequelize, DataTypes) {
  let BSDPersonBSDGroup = sequelize.define('BSDPersonBSDGroup', {
  }, {
    underscored: true,
    updatedAt: 'modified_dt',
    createdAt: 'create_dt',
    tableName: 'bsd_person_bsd_groups',
    classMethods: {
      associate: (models) => {
        models.BSDPerson.belongsToMany(models.BSDGroup, {
          through: BSDPersonBSDGroup,
          foreignKey: 'cons_id',
          as: 'people',
          constraints: false
        });
        models.BSDGroup.belongsToMany(models.BSDPerson, {
          through: BSDPersonBSDGroup,
          foreignKey: 'cons_group_id',
          as: 'groups',
          constraints: false
        });
      }
    }
  })
  return BSDPersonBSDGroup;
}