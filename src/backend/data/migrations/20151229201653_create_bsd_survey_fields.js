
exports.up = function(knex, Promise) {
  if (process.env.NODE_ENV === 'production')
    return null;
  return knex.schema.createTableIfNotExists('bsd_survey_fields', function(table) {
      table.bigint('signup_form_field_id').primary();
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
      table.bigint('signup_form_id').notNullable().index()
      table.string('stg_signup_column_name', 64)
      table.integer('format').notNullable()
      table.string('label', 20000)
      table.integer('display_order').notNullable()
      table.boolean('is_shown').notNullable()
      table.boolean('is_required').notNullable()
      table.string('description')
    })
};

exports.down = function(knex, Promise) {

};
