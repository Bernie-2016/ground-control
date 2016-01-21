
exports.up = async function(knex, Promise) {
  await knex.schema.raw('ALTER TABLE gc_bsd_events ADD COLUMN followup_emailed boolean NOT NULL DEFAULT true')

  await knex.schema.raw('ALTER TABLE gc_bsd_events ALTER followup_emailed DROP DEFAULT')
};

exports.down = function(knex, Promise) {

};
