
exports.up = async function(knex, Promise) {
  await knex.schema.raw('ALTER TABLE bsd_assigned_calls ALTER caller_id SET DATA TYPE bigint;');
  await knex.schema.raw('ALTER TABLE bsd_assigned_calls ALTER call_assignment_id SET DATA TYPE bigint;');
  await knex.schema.raw('ALTER TABLE bsd_call_assignments ALTER gc_bsd_survey_id SET DATA TYPE bigint;');
  await knex.schema.raw('ALTER TABLE bsd_call_assignments ALTER gc_bsd_group_id SET DATA TYPE bigint;');
  await knex.schema.raw('ALTER TABLE bsd_call_assignments ALTER gc_bsd_group_id SET DATA TYPE bigint;');
  await knex.schema.raw('ALTER TABLE bsd_calls ALTER caller_id SET DATA TYPE bigint;');
  await knex.schema.raw('ALTER TABLE bsd_calls ALTER call_assignment_id SET DATA TYPE bigint;');
};

exports.down = function(knex, Promise) {

};
