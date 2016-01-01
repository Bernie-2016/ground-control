
exports.up = async function(knex, Promise) {
  await knex.schema.table('bsd_call_assignments', function(table) {
    let currentTimestamp = new Date()
    table.timestamp('start_dt').notNullable().default(currentTimestamp.toISOString())
    table.timestamp('end_dt')
    table.bigint('caller_group').index().references('id').inTable('user_groups').nullable()
  })
  await knex.raw('alter table bsd_call_assignments rename gc_bsd_group_id to interviewee_group')
};

exports.down = function(knex, Promise) {

};
