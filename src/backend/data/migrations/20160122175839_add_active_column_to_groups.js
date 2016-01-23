
exports.up = function(knex, Promise) {
  return knex.schema.table('gc_bsd_groups', function(table) {
    table.boolean('active').notNullable().default(true)
  })
};

exports.down = function(knex, Promise) {

};
