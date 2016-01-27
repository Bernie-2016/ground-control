
exports.up = function(knex, Promise) {
  return knex.schema.table('gc_bsd_events', function(table) {
    table.string('event_id_obfuscated')
  })
};

exports.down = function(knex, Promise) {

};
