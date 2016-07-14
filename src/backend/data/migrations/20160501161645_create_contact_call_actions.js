
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('contact_call_actions', function(table) {
    table.increments('id').primary();
    table.bigint('contact_assignment_id')
    	.notNullable()
    	.index()
    	.references('id')
    	.inTable('contact_assignments');
    table.string('name', 64).notNullable();
    table.string('call_script', 1000).notNullable();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('contact_call_actions');
};
