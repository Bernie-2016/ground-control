export default function(sequelize, DataTypes) {
  let BSDPersonGCBSDGroup = sequelize.define('BSDPersonGCBSDGroup', {
  }, {
    underscored: true,
    updatedAt: 'modified_dt',
    createdAt: 'create_dt',
    tableName: 'bsd_person_gc_bsd_groups',
  })
  return BSDPersonGCBSDGroup;
}