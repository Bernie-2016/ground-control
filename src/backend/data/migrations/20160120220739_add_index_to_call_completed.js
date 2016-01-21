
exports.up = function(knex, Promise) {
  return knex.schema.table('bsd_calls', function(table) {
    table.index('completed')
  })
};

exports.down = function(knex, Promise) {

};
