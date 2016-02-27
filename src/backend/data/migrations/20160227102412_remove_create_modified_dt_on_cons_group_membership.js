
exports.up = async function(knex, Promise) {
  if (process.env.NODE_ENV === 'development') {
    await knex.schema.raw('ALTER TABLE bsd_person_bsd_groups DROP COLUMN modified_dt')
    await knex.schema.raw('ALTER TABLE bsd_person_bsd_groups DROP COLUMN create_dt')
  }
};

exports.down = function(knex, Promise) {

};
