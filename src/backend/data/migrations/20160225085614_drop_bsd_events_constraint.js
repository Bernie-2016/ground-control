
exports.up = async function(knex, Promise) {

    if (process.env.NODE_ENV === 'production'){
        return null;
    }

    await knex.schema.table('fast_fwd_request', function(table) {
        table.dropForeign('event_id');
    });
  
};

exports.down = async function(knex, Promise) {
    //
};
