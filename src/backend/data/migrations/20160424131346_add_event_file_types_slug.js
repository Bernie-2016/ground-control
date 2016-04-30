
exports.up = function(knex, Promise) {
  return knex.schema.table('event_file_types', function(table) {
    table.string('slug', 64).notNullable().unique();
  })
};

exports.down = function(knex, Promise) {

};
