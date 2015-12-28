
exports.up = function(knex, Promise) {
  return knex.schema.table('users',
    function(table) {
      table.bigint('cons_id').index();
    })
};

exports.down = function(knex, Promise) {

};
