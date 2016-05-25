
exports.up = async function(knex, Promise) {
    await knex('gc_bsd_surveys').where('renderer', 'PhonebankRSVPSurvey').update({'renderer': 'MultipleEventRSVPSurvey'})
};

exports.down = function(knex, Promise) {

};
