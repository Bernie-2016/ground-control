export default function(sequelize, DataTypes) {
  return sequelize.define('BSDEventType', {
    id: {
      type: DataTypes.INTEGER,
      field: 'event_type_id',
      primaryKey: true
    },
    name: DataTypes.STRING,
    description: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    updatedAt: 'modified_dt',
    createdAt: 'create_dt',
    underscored: true,
    tableName: 'bsd_event_types',
  })
}