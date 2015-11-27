export default function(sequelize, DataTypes) {
  let Group = sequelize.define('Group', {
    id: {
      type: DataTypes.BIGINT,
      field: 'cons_group_id',
      primaryKey: true
    },
    name: DataTypes.STRING,
    publicName: {
      type: DataTypes.STRING,
      field: 'public_name',
      allowNull: true
    },
  }, {
    updatedAt: 'modified_dt',
    createdAt: 'create_dt',
    underscored: true,
    tableName: 'bsd_cons_group',
  })
  return Group;
}