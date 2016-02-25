
exports.up = function(knex, Promise) {
  return knex('gc_bsd_events').update('pending_review', false)
};

exports.down = function(knex, Promise) {
  
};
