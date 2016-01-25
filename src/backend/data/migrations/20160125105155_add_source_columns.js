
exports.up = async function(knex, Promise) {
  await knex.schema.table('gc_bsd_events', function(table) {
    table.string('source_app')
    table.string('source')
  })
  await knex.schema.createTableIfNotExists('gc_bsd_event_attendees', function(table) {
    table.increments('id').primary();
    table.string('source_app')
    table.string('source')
  })
};

exports.down = function(knex, Promise) {

};
