
exports.up = function(knex, Promise) {
  return knex.schema.createTable('gc_bsd_events', function(table) {
    table.increments('id').primary();
    table.bigint('event_id').index();
    table.bigint('turn_out_assignment').index().references('id').inTable('bsd_call_assignments')
  })
};

exports.down = function(knex, Promise) {

};
