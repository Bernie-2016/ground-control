export default function(sequelize, DataTypes) {
  let Event = sequelize.define('BSDEvent', {
    id: {
      type: DataTypes.BIGINT,
      field: 'event_id',
      primaryKey: true
    },
    eventIdObfuscated: {
      type: DataTypes.STRING,
      field: 'event_id_obfuscated',
      allowNull: true
    },
    flagApproval: {
      type: DataTypes.BOOLEAN,
      field: 'flag_approval',
    },
    eventTypeId: {
      type: DataTypes.INTEGER,
      field: 'event_type_id',
    },
    name: {
      type: DataTypes.STRING,
      field: 'name',
    },
    description: {
      type: DataTypes.TEXT,
      field: 'description',
    },
    venueName: {
      type: DataTypes.STRING,
      field: 'venue_name',
    },
    venueZip: {
      type: DataTypes.STRING,
      field: 'venue_zip',
      allowNull: true
    },
    venueCity: {
      type: DataTypes.STRING,
      field: 'venue_city',
    },
    venueState: {
      type: DataTypes.STRING,
      field: 'venue_state_cd'
    },
    venueAddr1: {
      type: DataTypes.STRING,
      field: 'venue_addr1',
    },
    venueAddr2: {
      type: DataTypes.STRING,
      field: 'venue_addr2',
      allowNull: true
    },
    venueCountry: {
      type: DataTypes.STRING,
      field: 'venue_country',
    },
    venueDirections: {
      type: DataTypes.TEXT,
      field: 'venue_directions',
      allowNull: true
    },
    localTimezone: {
      type: DataTypes.STRING,
      field: 'start_tz',
      allowNull: true
    },
    startDate: {
      type: DataTypes.DATE,
      field: 'start_dt',
      allowNull: true,
      get: function(){
            let formattedDate = this.getDataValue('startDate').toISOString();
            // 'this' allows you to access attributes of the instance
            return formattedDate;
          }
    },
    duration: {
      type: DataTypes.FLOAT,
      field: 'duration',
      allowNull: true
    },
    capacity: {
      type: DataTypes.INTEGER,
      field: 'capacity'
    },
    attendeeVolunteerShow: {
      type: DataTypes.BOOLEAN,
      field: 'attendee_volunteer_show',
    },
    attendeeVolunteerMessage: {
      type: DataTypes.TEXT,
      field: 'attendee_volunteer_message',
    },
    isSearchable: {
      type: DataTypes.BIGINT,
      field: 'is_searchable',
    },
    publicPhone: {
      type: DataTypes.BOOLEAN,
      field: 'public_phone',
    },
    contactPhone: {
      type: DataTypes.STRING,
      field: 'contact_phone',
      allowNull: true
    },
    hostReceiveRsvpEmails: {
      type: DataTypes.BOOLEAN,
      field: 'host_receive_rsvp_emails',
    },
    rsvpUseReminderEmail: {
      type: DataTypes.BOOLEAN,
      field: 'rsvp_use_reminder_email',
    },
    rsvpReminderHours: {
      type: DataTypes.FLOAT,
      field: 'rsvp_reminder_hours',
      allowNull: true
    }
  }, {
    underscored: true,
    tableName: 'bsd_event',
    classMethods: {
      associate: (models) => {
        Event.belongsTo(models.BSDPerson, {foreignKey: 'creator_cons_id', as: 'host'})
      }
    }
  })
  return Event;
}