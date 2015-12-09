import BSDClient from '../../bsd-instance';
export default function(sequelize, DataTypes) {
  let BSDSurvey = sequelize.define('BSDSurvey', {
    id: {
      type: DataTypes.INTEGER,
      field: 'signup_form_id',
      primaryKey: true
    },
    slug: {
      type: DataTypes.STRING,
      field: 'signup_form_slug',
      allowNull: null
    }
  }, {
    updatedAt: 'modified_dt',
    createdAt: 'create_dt',
    underscored: true,
    tableName: 'bsd_surveys',
    classMethods: {
      createFromBSDObject: (BSDObject) => {
        let newSurvey = {...BSDObject};
        newSurvey.id = newSurvey.signup_form_id;
        newSurvey.slug = newSurvey.signup_form_slug;
        return BSDSurvey.create(newSurvey);
      },
      findWithBSDCheck: async (id) => {
        let survey = await BSDSurvey.findById(id);
        if (!survey) {
          try {
            let BSDSurveyResponse = await BSDClient.getForm(id);
            survey = await BSDSurvey.createFromBSDObject(BSDSurveyResponse)
          } catch (err) {
            if (err && err.response && err.response.statusCode === 409)
              survey = null;
            else
              throw err;
          }
        }
        return survey;
      }
    }
  })
  return BSDSurvey;
}