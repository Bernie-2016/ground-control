
exports.up = function(knex, Promise) {
	if (process.env.NODE_ENV === 'production')
		return
  return knex.schema.raw('alter table communications drop constraint communications_person_id_foreign')
};

exports.down = function(knex, Promise) {
  
};
