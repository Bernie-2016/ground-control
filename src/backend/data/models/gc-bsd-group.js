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
    updatedAt: 'modified_dt',
    createdAt: 'create_dt',
    indexes: [
      { fields: ['cons_group_id'] },
    ],
    classMethods: {
      associate: (models) => {
        GCBSDGroup.belongsTo(models.BSDGroup, {
          foreignKey: 'cons_group_id',
          as: 'BSDGroup',
          constraints: false
        });
        GCBSDGroup.belongsToMany(models.BSDPerson, {
          through: models.BSDPersonGCBSDGroup,
          foreignKey: 'gc_bsd_group_id',
          as: 'people'
        });
      }
    }
  })
  return GCBSDGroup;
}