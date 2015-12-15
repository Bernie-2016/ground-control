var pg = require('pg');
var log = require('../../backend/log')

var connString = process.env.DATABASE_URL;
var client;

module.exports = {};

// The default callback allows us to log errors to the console in the event our
// function is called syncronously.
// This is prefered over throwing since compilers don't optimize functions
// containing throw statements.
var default_cb = module.exports.default_callback = function default_cb(e) {
  if(e) {
    log.error(e.stack);
  }
};

// Query the database
module.exports.job = function bsd_assigned_calls_ttl_job(cb) {
  // If this function wasn't supplied a callback, use the default
  cb = cb || default_cb

  // Make sure the client exists
  if(!client) return module.exports.init(function fallback_init(e) {

    if(e) {
      return cb(e); // we have nothing to do.
    }

    // Client created, execute query
    return bsd_assigned_calls_ttl_query(cb);
  })

  // Client exists, execute query
  return bsd_assigned_calls_ttl_query(cb);
}

// The actual job to be done
function bsd_assigned_calls_ttl_query(cb) {
  // If this function wasn't supplied a callback, use the default
  cb = cb || default_cb;


  // Delete all calls that haven't been updated in the last hour
  client.query("DELETE FROM bsd_assigned_calls Where modified_dt < NOW() - INTERVAL '1 hour'",function(e) {
    cb(e);
  });
};

// Establish a connection to the database
module.exports.init = function bsd_assigned_calls_ttl_init(cb) {
  // If this function wasn't supplied a callback, use the default
  cb = cb || default_cb;

  // Create a single persistant connection to the database
  client = new pg.Client(connString);
  client.connect(function bsd_assigned_calls_ttl_establish_connection(e) {
    cb(e); //propogate errors back up
  });
};

// Allow callers to sever connection to database
module.exports.destroy = function bsd_assigned_calls_ttl_destroy(cb) {
  // If this function wasn't supplied a callback, use the default
  cb = cb || default_cb;

  // ensure client exists and end can be called
  if(client && typeof client.end === "function") client.end();

  // No way to fail
  cb();
};
