export default function(sequelize, DataTypes) {
  return sequelize.define('BSDGroup', {
    BSDId: {
      type: DataTypes.BIGINT,
      field: 'bsd_id',
      allowNull: true
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    underscored: true,
    tableName: 'bsd_groups',
  })
}