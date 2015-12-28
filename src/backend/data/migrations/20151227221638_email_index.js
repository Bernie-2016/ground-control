
exports.up = function(knex, Promise) {
  return knex.schema.table('bsd_emails', function(table) {
    table.index('email')
  })
};

exports.down = function(knex, Promise) {

};
