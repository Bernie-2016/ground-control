
exports.up = function(knex, Promise) {
  return knex.schema.table('bsd_assigned_calls', function(table) {
    table.unique('caller_id')
  })
};

exports.down = function(knex, Promise) {

};
