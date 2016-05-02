
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('contact_assignments', function(table) {
    table.increments('id')
    	.primary();
    table.timestamp('expires')
    	.notNullable();
    table.string('name', 64)
    	.notNullable();
    table.string('description', 2000)
    	.notNullable();
    table.string('instructions', 2000)
    	.notNullable();
    table.boolean('require_call_first')
    	.notNullable()
    	.defaultTo(false);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('contact_assignments');
};
