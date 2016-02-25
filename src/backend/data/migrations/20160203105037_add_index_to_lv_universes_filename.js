
exports.up = function(knex, Promise) {
	return;
  return knex.schema.table('livevox_universes', function(table) {
    table.index('filename')
  })
};

exports.down = function(knex, Promise) {

};
