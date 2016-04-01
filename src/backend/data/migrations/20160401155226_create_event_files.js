
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('event_files', function(table) {
    table.increments('id').primary();
    table.bigint('event_file_type_id').index().references('id').inTable('event_file_types');
    table.bigint('event_id').index();
    table.bigint('uploader_id').references('id').inTable('users');
    table.timestamp('create_dt').notNullable();
    table.timestamp('modified_dt').notNullable();
    table.string('mime_type', 64).notNullable();
    table.string('name', 64).notNullable();
    table.string('notes', 2000);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('event_files');
};
