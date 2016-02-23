
exports.up = function(knex, Promise) {
  return knex.schema.table('gc_bsd_events', function(table) {
    table.index('pending_review')
  })
};

exports.down = function(knex, Promise) {

};
