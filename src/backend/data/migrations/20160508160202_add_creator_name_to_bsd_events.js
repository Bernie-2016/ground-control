
exports.up = async function(knex, Promise) {

    if (process.env.NODE_ENV === 'production'){
        return null;
    }
    else {
    	return knex.schema.table('bsd_events', function(table) {
    	  table.string('creator_name', 255)
    	  	.notNullable()
    	})
    }
  
};

exports.down = async function(knex, Promise) {
    //
};
