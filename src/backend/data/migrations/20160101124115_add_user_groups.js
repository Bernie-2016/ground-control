
exports.up = async function(knex, Promise) {
  await knex.schema.createTable('user_groups', function(table) {
    table.increments('id').primary();
    table.string('name');
  })

  await knex.schema.createTable('user_user_groups', function(table) {
    table.bigint('user_id').index().references('id').inTable('users');
    table.bigint('user_group_id').index().references('id').inTable('user_groups')
    table.primary(['user_id', 'user_group_id']);
  })
};

exports.down = function(knex, Promise) {

};
