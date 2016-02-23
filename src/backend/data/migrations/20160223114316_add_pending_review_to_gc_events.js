
exports.up = function(knex, Promise) {
  return knex.schema.table('gc_bsd_events', function(table) {
    table.boolean('pending_review')
    	.notNullable()
    	.defaultTo(true)
  })
};

exports.down = function(knex, Promise) {

};
