
exports.up = async function(knex, Promise) {
    await knex.schema.createTable('fast_fwd_request', function(table) {
        table.increments('id').primary();
        table.bigint('event_id').notNullable().index().references('event_id').inTable('bsd_events');
        table.text('host_message').notNullable();
        table.timestamp('email_sent_dt').nullable();
        table.timestamp('modified_dt').notNullable();
        table.timestamp('create_dt').notNullable();
    })

    await knex.schema.table('gc_bsd_events', function(table){
        table.boolean('fast_fwd_instructions_sent').notNullable().defaultTo(false)
    })
  
};

exports.down = async function(knex, Promise) {
    await knex.schema.dropTable('fast_fwd_request')
    await knex.schema.table('gc_bsd_events', function(table){
        table.dropColumn('fast_fwd_instructions_sent')
    })
};
