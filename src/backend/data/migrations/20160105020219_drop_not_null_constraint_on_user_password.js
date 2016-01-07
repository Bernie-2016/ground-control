
exports.up = async function(knex, Promise) {
  await knex.schema.raw('ALTER TABLE users ALTER COLUMN password DROP NOT NULL')
  await knex.schema.raw('ALTER TABLE bsd_call_assignments ALTER COLUMN renderer SET NOT NULL')
  await knex.schema.raw('ALTER TABLE gc_bsd_surveys ALTER COLUMN processors SET NOT NULL')
};

exports.down = function(knex, Promise) {

};
