
exports.up = function(knex, Promise) {
  return knex.schema.table('users', function(table) {
    table.boolean('is_superuser')
    	.notNullable()
    	.defaultTo(false)
  })
};

exports.down = async function(knex, Promise) {
	await knex.schema.table('users', function(table){
		table.dropColumn('is_superuser')
	})
};
