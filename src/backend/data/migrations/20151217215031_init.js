
exports.up = async function(knex, Promise) {
  let promises = [
    knex.schema.createTableIfNotExists('zip_codes', function(table) {
      table.increments('id').primary();
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
      table.string('zip').unique().index();
      table.string('city').notNullable()
      table.string('state').notNullable();
      table.float('latitude').notNullable();
      table.float('longitude').notNullable();
      table.integer('timezone_offset').notNullable().index();
      table.boolean('has_dst').notNullable();
    }),

    knex.schema.createTableIfNotExists('bsd_people', function(table) {
      table.bigint('cons_id').primary();
      table.string('prefix', 16);
      table.string('firstname', 256);
      table.string('middlename', 128);
      table.string('lastname', 256);
      table.string('suffix', 16);
      table.specificType('gender', 'char(1)');
      table.specificType('birth_dt', 'timestamp without time zone');
      table.string('title', 128);
      table.string('employer', 128);
      table.string('occupation', 255);
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
    }),

    knex.schema.createTableIfNotExists('bsd_addresses', function(table) {
      table.bigint('cons_addr_id').primary();
      table.bigint('cons_id').notNullable().index();
      table.boolean('is_primary').index();
      table.string('addr1', 300);
      table.string('addr2', 300);
      table.string('addr3', 300);
      table.string('city', 200);
      table.string('state_cd', 200).index();
      table.string('zip', 30).index();
      table.string('zip_4', 20);
      table.specificType('country', 'char(2)');
      table.specificType('latitude', 'double precision').notNullable().index();
      table.specificType('longitude', 'double precision').notNullable().index();
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
    }),

    knex.schema.createTableIfNotExists('bsd_surveys', function(table) {
      table.bigint('signup_form_id').primary();
      table.string('signup_form_slug', 100);
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
    }),

    knex.schema.createTableIfNotExists('bsd_events', function(table) {
      table.bigint('event_id').primary();
      table.specificType('event_id_obfuscated', 'varchar(16)');
      table.boolean('flag_approval').notNullable();
      table.specificType('name', 'varchar(256)').notNullable();
      table.text('description').notNullable();
      table.specificType('venue_name', 'varchar(300)').notNullable();
      table.specificType('venue_zip', 'varchar(16)');
      table.specificType('venue_city', 'varchar(128)').notNullable();
      table.specificType('venue_state_cd', 'char(100)').notNullable();
      table.string('venue_addr1').notNullable();
      table.string('venue_addr2')
      table.specificType('venue_country', 'char(2)').notNullable();
      table.text('venue_directions');
      table.specificType('start_tz', 'varchar(40)');
      table.specificType('start_dt', 'timestamp without time zone').index();
      table.bigint('duration');
      table.bigint('capacity').notNullable();
      table.bigint('attendee_volunteer_show').notNullable();
      table.text('attendee_volunteer_message');
      table.bigint('is_searchable').notNullable();
      table.boolean('public_phone').notNullable();
      table.specificType('contact_phone', 'varchar(25)');
      table.boolean('host_receive_rsvp_emails').notNullable();
      table.boolean('rsvp_use_reminder_email').notNullable();
      table.bigint('rsvp_email_reminder_hours');
      table.specificType('latitude', 'double precision').notNullable().index();
      table.specificType('longitude', 'double precision').notNullable().index();
      table.bigint('creator_cons_id').index().notNullable();
      table.bigint('event_type_id').index().notNullable();
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
    }),

    knex.schema.createTableIfNotExists('bsd_groups', function(table) {
      table.bigint('cons_group_id').primary();
      table.string('name').notNullable();
      table.text('description')
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
    }),

    knex.schema.createTableIfNotExists('bsd_person_bsd_groups', function(table) {
      table.bigint('cons_id').notNullable().index();
      table.bigint('cons_group_id').notNullable().index();
      table.primary(['cons_id', 'cons_group_id']);
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
    }),

    knex.schema.createTableIfNotExists('bsd_event_types', function(table) {
      table.bigint('event_type_id').primary();
      table.string('name', 128).notNullable();
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
    }),

    knex.schema.createTableIfNotExists('bsd_phones', function(table) {
      table.bigint('cons_phone_id').primary();
      table.bigint('cons_id').notNullable().index();
      table.boolean('is_primary').notNullable();
      table.string('phone', 30).notNullable();
      table.boolean('isunsub')
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
    }),

    knex.schema.createTableIfNotExists('bsd_emails', function(table) {
      table.bigint('cons_email_id').primary();
      table.bigint('cons_id').notNullable().index();
      table.boolean('is_primary').notNullable().index();
      table.string('email').notNullable();
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
    }),

    knex.schema.createTableIfNotExists('bsd_event_attendees', function(table) {
      table.bigint('event_attendee_id').primary();
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
      table.bigint('attendee_cons_id').notNullable().index();
      table.bigint('event_id').notNullable().index();
    }),

    knex.schema.createTableIfNotExists('gc_bsd_surveys', function(table) {
      table.increments('id').primary();
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
      table.enu('renderer', ['BSDSurvey', 'BSDPhonebankRSVPSurvey']);
      table.specificType('processors', 'varchar(255)[]');
      table.bigint('signup_form_id').notNullable().index();
    }),

    knex.schema.createTableIfNotExists('bsd_audits', function(table) {
      table.increments('id').primary();
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
      table.string('class').notNullable();
      table.string('method').notNullable();
      table.string('params').notNullable();
      table.string('error').notNullable();
    }),

    knex.schema.createTableIfNotExists('gc_bsd_groups', function(table) {
      table.increments('id').primary();
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
      table.text('query');
      table.bigint('cons_group_id').index().nullable();
    }),

    knex.schema.createTableIfNotExists('bsd_person_gc_bsd_groups', function(table) {
      table.bigint('cons_id').index().notNullable();
      table.integer('gc_bsd_group_id').index().notNullable();
      table.primary(['cons_id', 'gc_bsd_group_id']);
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
    }),

    knex.schema.createTableIfNotExists('users', function (table) {
      table.increments('id').primary();
      table.string('email').notNullable().unique();
      table.boolean('is_admin').notNullable().defaultTo(false);
      table.string('password').notNullable();
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
    }),

    knex.schema.createTableIfNotExists('sessions', function(table) {
      table.string('sid').primary();
      table.json('sess').notNullable();
      table.timestamp('expired', 'true').notNullable().index();
    })
  ]

  await Promise.all(promises);
  await knex.schema.createTableIfNotExists('bsd_call_assignments', function(table) {
    table.increments('id').primary();
    table.timestamp('modified_dt').notNullable();
    table.timestamp('create_dt').notNullable();
    table.string('name').notNullable();
    table.integer('gc_bsd_survey_id').index().references('id').inTable('gc_bsd_surveys').notNullable();
    table.integer('gc_bsd_group_id').index().references('id').inTable('gc_bsd_groups').notNullable();
  });
  await knex.schema.createTableIfNotExists('bsd_calls', function(table) {
    table.increments('id').primary();
    table.timestamp('modified_dt').notNullable();
    table.timestamp('create_dt').notNullable();
    table.timestamp('attempted_at').notNullable().index();
    table.boolean('left_voicemail');
    table.boolean('sent_text');
    table.enu('reason_not_completed', ['NO_PICKUP', 'CALL_BACK', 'NOT_INTERESTED', 'OTHER_LANGUAGE', 'WRONG_NUMBER', 'DISCONNECTED_NUMBER']).index()
    table.integer('caller_id').index().notNullable().references('id').inTable('users')
    table.bigint('interviewee_id').index().notNullable()
    table.integer('call_assignment_id').index().notNullable().references('id').inTable('bsd_call_assignments')
  });
  await knex.schema.createTableIfNotExists('bsd_assigned_calls', function(table) {
    table.increments('id').primary();
    table.timestamp('modified_dt').notNullable();
    table.timestamp('create_dt').notNullable();
    table.integer('caller_id').index().references('id').inTable('users').notNullable();
    table.bigint('interviewee_id').index().notNullable();
    table.integer('call_assignment_id').index().references('id').inTable('bsd_call_assignments').notNullable();
  });
};

exports.down = function(knex, Promise) {

};
