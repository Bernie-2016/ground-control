
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('bsd_calls', function(table) {
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
};

exports.down = function(knex, Promise) {
  knex.schema.dropTable('bsd_calls')
};
