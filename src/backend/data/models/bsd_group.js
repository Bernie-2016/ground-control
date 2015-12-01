export default function(sequelize, DataTypes) {
  return sequelize.define('BSDGroup', {
    id: {
      type: DataTypes.BIGINT,
      field: 'cons_group_id',
      primaryKey: true
    },
    name: DataTypes.STRING,
    description: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    underscored: true,
    tableName: 'bsd_cons_group',
  })
}