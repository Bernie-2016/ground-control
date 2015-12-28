
exports.up = async function(knex, Promise) {
  await knex.schema.raw('alter table bsd_assigned_calls drop constraint bsd_assigned_calls_caller_id_unique')
  return knex.schema.table('bsd_assigned_calls', function(table) {
    table.unique(['caller_id', 'call_assignment_id'])
  })
};

exports.down = function(knex, Promise) {

};
