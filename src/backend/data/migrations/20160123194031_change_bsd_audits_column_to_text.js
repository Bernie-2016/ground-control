
exports.up = async function(knex, Promise) {
  await knex.schema.raw('ALTER TABLE bsd_audits ALTER error SET DATA TYPE text;')
  await knex.schema.raw('ALTER TABLE bsd_audits ALTER params SET DATA TYPE text;')
};

exports.down = function(knex, Promise) {

};
