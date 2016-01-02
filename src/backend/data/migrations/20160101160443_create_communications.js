exports.up = async (knex, Promise) => {
  await knex.schema.createTableIfNotExists('communications', (table) => {
    table.increments('id').primary()
    table.timestamp('modified_dt').notNullable()
    table.timestamp('create_dt').notNullable()
    table.integer('person_id').index().references('cons_id').inTable('bsd_people').notNullable()
    table.string('type').notNullable()
  })
}

exports.down = async (knex, Promise) => {
  await knex.schema.dropTableIfExists('communications')
}
