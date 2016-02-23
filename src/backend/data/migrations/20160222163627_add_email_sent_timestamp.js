
exports.up = function(knex, Promise) {

    return knex.schema.table('boost_attendance_request', function(table) {
      table.timestamp('email_sent_dt').nullable()
    })
  
};

exports.down = function(knex, Promise) {
  
};
