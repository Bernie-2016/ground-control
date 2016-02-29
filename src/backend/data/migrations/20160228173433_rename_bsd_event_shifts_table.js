
exports.up = async function(knex, Promise) {

    if(await knex.schema.hasTable('event_shift')){
        await knex.schema.renameTable('event_shift', 'bsd_event_shifts');
    }
  
};

exports.down = async function(knex, Promise) {
  
    if(await knex.schema.hasTable('bsd_event_shifts')){
        await knex.schema.renameTable('bsd_event_shifts', 'event_shift');
    }

};
