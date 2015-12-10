export default function(sequelize, DataTypes) {
  let BSDPersonGCBSDGroup = sequelize.define('BSDPersonGCBSDGroup', {
  }, {
    underscored: true,
    tableName: 'bsd_person_gc_bsd_groups',
    classMethods: {
      associate: (models) => {
        models.BSDPerson.belongsToMany(models.GCBSDGroup, {
          through: BSDPersonGCBSDGroup,
          foreignKey: 'cons_id',
          as: 'people',
          constraints: false
        });
        models.GCBSDGroup.belongsToMany(models.BSDPerson, {
          through: BSDPersonBSDGroup,
          foreignKey: 'gc_bsd_group_id',
          as: 'groups',
          constraints: false
        });
      }
    }
  })
  return BSDPersonGCBSDGroup;
}