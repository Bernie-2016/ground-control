import BSDClient from '../../bsd-instance';
export default function(sequelize, DataTypes) {
  let GCBSDGroup = sequelize.define('GCBSDGroup', {
    query: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    underscored: true,
    tableName: 'gc_bsd_groups',
    indexes: [
      { fields: ['cons_group_id'] },
    ],
    classMethods: {
      associate: (models) => {
        GCBSDGroup.belongsTo(models.BSDGroup, {
          foreignKey: 'cons_group_id',
          as: 'BSDGroup',
          constraints: false
        })
      }
    }
  })
  return GCBSDGroup;
}