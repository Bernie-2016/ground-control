
exports.up = function(knex, Promise) {
  return knex.schema.table('bsd_calls', function(table) {
    table.boolean('completed')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('bsd_calls', function(table) {
    table.dropColumn('completed')
  })
};
