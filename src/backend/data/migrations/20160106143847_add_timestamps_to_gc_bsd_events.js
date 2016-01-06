
exports.up = function(knex, Promise) {
  return knex.schema.table('gc_bsd_events', function(table) {
    table.timestamp('modified_dt').notNullable()
    table.timestamp('create_dt').notNullable()
  })
};

exports.down = function(knex, Promise) {

};
