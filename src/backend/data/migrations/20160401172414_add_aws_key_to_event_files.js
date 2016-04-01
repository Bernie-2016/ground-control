
exports.up = function(knex, Promise) {
  return knex.schema.table('event_files', function(table) {
    table.string('s3_key', 200).notNullable();
  })
};

exports.down = function(knex, Promise) {
  
};
