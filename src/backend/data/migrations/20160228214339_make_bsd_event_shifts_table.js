
exports.up = async function(knex, Promise) {

    if (process.env.NODE_ENV === 'production'){
        return null;
    }

    await knex.schema.createTable('bsd_event_shifts', function(table) {
    	table.bigInteger('event_shift_id');
    	table.bigInteger('event_id');
    	table.time('start_time');
    	table.timestamp('start_dt');
    	table.time('end_time');
    	table.timestamp('end_dt');
    	table.bigInteger('capacity');
    })
  
};

exports.down = async function(knex, Promise) {
  await knex.schema.dropTable('bsd_event_shifts')
};
