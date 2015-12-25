exports.up = async function(knex, Promise) {
  await knex.schema.raw('ALTER TABLE bsd_call_assignments ALTER instructions DROP NOT NULL;');
};

exports.down = async function(knex, Promise) {
  await knex.schema.raw('ALTER TABLE bsd_call_assignments ALTER instructions SET NOT NULL;');
};
