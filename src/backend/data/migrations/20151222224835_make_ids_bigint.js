
exports.up = async function(knex, Promise) {
  await knex.schema.raw('ALTER TABLE bsd_assigned_calls ALTER id SET DATA TYPE bigint;');
  await knex.schema.raw('ALTER TABLE bsd_audits ALTER id SET DATA TYPE bigint;');
  await knex.schema.raw('ALTER TABLE bsd_call_assignments ALTER id SET DATA TYPE bigint;');
  await knex.schema.raw('ALTER TABLE bsd_calls ALTER id SET DATA TYPE bigint;');
  await knex.schema.raw('ALTER TABLE gc_bsd_groups ALTER id SET DATA TYPE bigint;');
  await knex.schema.raw('ALTER TABLE gc_bsd_surveys ALTER id SET DATA TYPE bigint;');
  await knex.schema.raw('ALTER TABLE users ALTER id SET DATA TYPE bigint;');
  await knex.schema.raw('ALTER TABLE zip_codes ALTER id SET DATA TYPE bigint;');
};

exports.down = function(knex, Promise) {

};
