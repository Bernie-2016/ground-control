exports.up = async (knex, Promise) => {
  await knex.schema.createTableIfNotExists('communications', (table) => {
    table.integer('person_id').index().references('cons_id').inTable('bsd_people').notNullable()
    table.timestamp('last_contacted_dt').notNullable()
    table.string('type').notNullable()
  })
}

exports.down = async (knex, Promise) => {
  await knex.schema.dropTableIfExists('communications')
}
