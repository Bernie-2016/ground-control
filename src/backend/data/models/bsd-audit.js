export default function(sequelize, DataTypes) {
  let BSDAudit = sequelize.define('BSDAudit', {
    class: {
      type: DataTypes.STRING
    },
    method: {
      type: DataTypes.STRING
    },
    params: {
      type: DataTypes.STRING
    },
    error: {
      type: DataTypes.STRING
    }
  }, {
    updatedAt: 'modified_dt',
    createdAt: 'create_dt',
    underscored: true,
    tableName: 'bsd_audits',
    indexes: [
      { fields: ['id'] }
    ]
  })
  return BSDAudit;
}