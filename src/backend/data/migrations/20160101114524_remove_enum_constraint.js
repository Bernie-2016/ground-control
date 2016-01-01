
exports.up = async function(knex, Promise) {
  await knex.schema.raw('alter table gc_bsd_surveys drop constraint gc_bsd_surveys_renderer_check')
};

exports.down = function(knex, Promise) {

};
