
exports.up = async function(knex, Promise) {
    await knex('gc_bsd_surveys').where('renderer', 'BSDPhonebankRSVPSurvey').update({'renderer': 'PhonebankRSVPSurvey'})
};

exports.down = function(knex, Promise) {

};
