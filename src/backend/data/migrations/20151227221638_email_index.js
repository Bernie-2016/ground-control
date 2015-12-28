
exports.up = function(knex, Promise) {
  if (process.env.NODE_ENV === 'production')
    return null;
  return knex.schema.table('bsd_emails', function(table) {
    table.index('email')
  })
};

exports.down = function(knex, Promise) {

};
