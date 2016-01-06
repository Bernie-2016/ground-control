
exports.up = function(knex, Promise) {
  return knex.schema.table('gc_bsd_events', function(table) {
    table.unique('event_id')
  })
};

exports.down = function(knex, Promise) {

};
