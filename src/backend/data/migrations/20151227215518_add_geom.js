
exports.up = function(knex, Promise) {
  if (process.env.NODE_env === 'production')
    return null;

  let promises = [
    knex.schema.raw("SELECT addgeometrycolumn('bsd_addresses', 'geom', 900913, 'POINT', 2)"),
    knex.schema.raw("SELECT addgeometrycolumn('bsd_events', 'geom', 900913, 'POINT', 2)")
  ]
  return Promise.all(promises)
};

exports.down = function(knex, Promise) {

};
