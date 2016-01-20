
exports.up = function(knex, Promise) {
  if (process.env.NODE_ENV === 'production')
    return null;
  return knex.schema.table('bsd_events', function(table) {
    table.boolean('is_official')
  })
};

exports.down = function(knex, Promise) {

};
