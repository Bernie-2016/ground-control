
exports.up = function(knex, Promise) {
  return knex.schema.table('bsd_call_assignments', function(table) {
      table.text('instructions').notNullable().defaultTo('')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('bsd_call_assignments', function(table) {
    table.dropColumn('instructions')
  })
};
