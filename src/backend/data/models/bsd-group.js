import BSDClient from '../../bsd-instance';
export default function(sequelize, DataTypes) {
  let BSDGroup = sequelize.define('BSDGroup', {
    id: {
      type: DataTypes.INTEGER,
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
    tableName: 'bsd_groups',
    updatedAt: 'modified_dt',
    createdAt: 'create_dt',
    classMethods: {
      createFromBSDObject: (BSDObject) => {
        let newGroup = {...BSDObject};
        newGroup.id = newSurvey.cons_group_id;
        return BSDGroup.create(newGroup);
      },
      findWithBSDCheck: async (id) => {
        let group = await BSDGroup.findById(id);
        if (!group) {
          try {
            let BSDGroupResponse = await BSDClient.getConstituentGroup(id);
            group = await BSDGroup.createFromBSDObject(BSDGroupResponse)
          } catch (err) {
            if (err && err.response && err.response.statusCode === 409)
              group = null;
            else
              throw err;
          }
        }
        return group;
      }
    }
  })
  return BSDGroup;
}