
exports.up = async function(knex, Promise) {
  await knex.schema.raw("SELECT addgeometrycolumn('zip_codes', 'geom', 900913, 'POINT', 2)"),
  await knex.schema.raw("UPDATE zip_codes set geom = ST_Transform(ST_GeomFromText('POINT(' || longitude || ' ' || latitude || ')',4326), 900913)")
  await knex.schema.raw("CREATE INDEX zip_codes_idx_geom on zip_codes using gist(geom)")
};

exports.down = function(knex, Promise) {

};
