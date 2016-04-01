
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('event_file_types', function(table) {
    table.increments('id').primary();
    table.timestamp('create_dt').notNullable();
    table.timestamp('modified_dt').notNullable();
    table.string('name', 64).notNullable();
    table.string('description', 2000);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('event_file_types');
};
