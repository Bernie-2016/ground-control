
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('bsd_call_assignments', function(table) {
    table.increments('id').primary();
    table.timestamp('modified_dt').notNullable();
    table.timestamp('create_dt').notNullable();
    table.string('name').notNullable();
    table.integer('gc_bsd_survey_id').index().references('id').inTable('gc_bsd_surveys').notNullable();
    table.integer('gc_bsd_group_id').index().references('id').inTable('gc_bsd_groups').notNullable();
  });
};

exports.down = function(knex, Promise) {
  knex.schema.dropTable('bsd_call_assignments');
};
