
exports.up = function(knex, Promise) {
  return knex.schema.table('bsd_events', function(table) {
    table.index('event_id_obfuscated')
  })
};

exports.down = function(knex, Promise) {

};
