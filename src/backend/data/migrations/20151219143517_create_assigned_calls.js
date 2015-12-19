
exports.up = function(knex, Promise) {
  knex.schema.createTableIfNotExists('bsd_assigned_calls', function(table) {
    table.increments('id').primary();
    table.timestamp('modified_dt').notNullable();
    table.timestamp('create_dt').notNullable();
    table.integer('caller_id').index().references('id').inTable('users').notNullable();
    table.bigint('interviewee_id').index().notNullable();
    table.integer('call_assignment_id').index().references('id').inTable('bsd_call_assignments').notNullable();
  });
};

exports.down = function(knex, Promise) {
  knex.schema.dropTable('bsd_assigned_calls')
};
