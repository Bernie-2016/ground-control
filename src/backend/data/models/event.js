export default function(sequelize, DataTypes) {
  return sequelize.define('Event', {
    BSDId: {
      type: DataTypes.BIGINT,
      field: 'bsd_id',
      allowNull: true
    },
    id: {
      type: DataTypes.BIGINT,
      field: 'id',
      primaryKey: true
    },
    eventIdObfuscated: {
      type: DataTypes.STRING,
      field: 'event_id_obfuscated',
    },
    flagApproval: {
      type: DataTypes.BOOLEAN,
      field: 'flag_approval',
    },
    eventTypeId: {
      type: DataTypes.INTEGER,
      field: 'event_type_id',
    },
    creatorConsId: {
      type: DataTypes.INTEGER,
      field: 'creator_cons_id',
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
    },
    venueCity: {
      type: DataTypes.STRING,
      field: 'venue_city',
    },
    venueState: {
      type: DataTypes.STRING,
      field: 'venue_state_cd',
      allowNull: true
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
      field: 'local_timezone',
    },
    startDatetime: {
      type: DataTypes.STRING,
      field: 'start_datetime_system'
    },
    duration: {
      type: DataTypes.FLOAT,
      field: 'duration'
    },
    capacity: {
      type: DataTypes.INTEGER,
      field: 'capacity'
    },
    attendeeVolunteerShow: {
      type: DataTypes.BOOLEAN,
      field: 'attendee_volunteer_show',
      allowNull: true
    },
    attendeeVolunteerMessage: {
      type: DataTypes.TEXT,
      field: 'attendee_volunteer_message',
      allowNull: true
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
    },
    hostReceiveRsvpEmails: {
      type: DataTypes.BOOLEAN,
      field: 'host_receive_rsvp_emails',
      allowNull: true
    },
    rsvpUseReminderEmail: {
      type: DataTypes.BOOLEAN,
      field: 'rsvp_use_reminder_email',
      allowNull: true
    },
    rsvpReminderHours: {
      type: DataTypes.FLOAT,
      field: 'rsvp_reminder_hours',
      allowNull: true
    }
  }, {
    underscored: true,
    tableName: 'events',
  })
}