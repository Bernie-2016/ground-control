export default function(sequelize, DataTypes) {
  let GCAudit = sequelize.define('GCAudit', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      primaryKey: true
    },
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
    underscored: true,
    tableName: 'gc_audits',
    indexes: [
      { fields: ['id'] }
    ]
  })
  return GCAudit;
}