
exports.up = async function(knex, Promise) {
  await knex.schema.raw('ALTER TABLE bsd_person_gc_bsd_groups DROP CONSTRAINT bsd_person_gc_bsd_groups_pkey')
  await knex.schema.table('bsd_person_gc_bsd_groups', function(table) {
    table.increments('id').primary();
  })
};

exports.down = function(knex, Promise) {

};
