
exports.up = function(knex, Promise) {
  return knex.schema.table('user_groups', function(table) {
    table.timestamp('modified_dt').notNullable()
    table.timestamp('create_dt').notNullable()
  })
};

exports.down = function(knex, Promise) {

};
