export default function(sequelize, DataTypes) {
  let BSDEventAttendee = sequelize.define('BSDEventAttendee', {
    id: {
      type: DataTypes.INTEGER,
      field: 'event_attendee_id',
      primaryKey: true
    },
  }, {
    updatedAt: 'modified_dt',
    createdAt: 'create_dt',
    underscored: true,
    tableName: 'bsd_event_attendees',
    classMethods: {
      associate: (models) => {
        BSDEventAttendee.belongsTo(models.BSDPerson, {
          foreignKey: 'attendee_cons_id',
          as: 'person',
          constraints: false
        })

        BSDEventAttendee.belongsTo(models.BSDEvent, {
          foreignKey: 'event_id',
          as: 'person',
          constraints: false
        })
      }
    }
  })
  return BSDEventAttendee
}