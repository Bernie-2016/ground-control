
exports.up = async function(knex, Promise) {
  await knex.schema.table('bsd_call_assignments', function(table) {
    table.text('renderer')
  })
  let surveys = await knex('gc_bsd_surveys')
  let surveyLength = surveys.length
  for (let i = 0; i < surveyLength; i++) {
    await knex('bsd_call_assignments')
      .where('gc_bsd_survey_id', surveys[i].id)
      .update({
        renderer: surveys[i].renderer
      })
  }
  await knex.schema.table('gc_bsd_surveys', function(table) {
    table.dropColumn('renderer')
  })
};

exports.down = function(knex, Promise) {

};
