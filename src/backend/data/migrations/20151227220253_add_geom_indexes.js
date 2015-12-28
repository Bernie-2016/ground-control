
exports.up = function(knex, Promise) {
    if (process.env.NODE_ENV === 'production')
      return null;
    let promises = [
    knex.schema.raw("CREATE INDEX bsd_events_idx_geom on bsd_events using gist(geom)"),
    knex.schema.raw("CREATE INDEX bsd_addresses_idx_geom on bsd_addresses using gist(geom)")
  ]
  return Promise.all(promises)
};

exports.down = function(knex, Promise) {

};
