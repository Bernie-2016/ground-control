
exports.up = async function(knex, Promise) {
  await knex.schema.raw('DROP TABLE livevox_contacts')
  await knex.schema.createTable('livevox_contacts', function(table) {
    table.increments('id').primary();
    table.timestamp('modified_dt').notNullable();
    table.timestamp('create_dt').notNullable();
    table.string('raw_van_id').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.specificType('phone', 'char(10)').notNullable().index();
    table.string('livevox_result').notNullable();
    table.timestamp('date_canvassed').notNullable();
    table.integer('call_duration').notNullable();
    table.string('agent_id');
    table.bigint('van_id').index();
    table.bigint('livevox_universe_id').notNullable().index().references('id').inTable('livevox_universes');
    table.unique(['raw_van_id', 'livevox_universe_id', 'date_canvassed']);
  })
};

exports.down = function(knex, Promise) {

};
