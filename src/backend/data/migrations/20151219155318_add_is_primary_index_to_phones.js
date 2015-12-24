
exports.up = function(knex, Promise) {
  return knex.schema.table('bsd_phones', function(table) {
    table.index('is_primary')
  })
};

exports.down = function(knex, Promise) {

};
