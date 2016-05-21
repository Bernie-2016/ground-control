
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('event_host_moderation_advisory', function(table) {
    table.increments('id')
    	.primary();
    table.timestamp('create_dt')
    	.notNullable()
    	.defaultTo(knex.raw('now()'));
    table.string('email')
    	.notNullable()
    	.unique();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('event_host_moderation_advisory');
};
