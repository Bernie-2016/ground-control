import BSDClient from '../../bsd-instance';
export default function(sequelize, DataTypes) {
  let GCBSDSurvey = sequelize.define('GCBSDSurvey', {
    renderer: {
      type: DataTypes.STRING,
      isIn: [['BSDSurvey', 'BSDPhonebankRSVPSurvey']]
    },
    processors: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      validate: {
        elementIsIn: function(val) {
          let validProcessors = ['bsd-event-rsvper']
          val.forEach((element) => {
            if (validProcessors.indexOf(element) === -1)
              throw new Error('Processors must each be one of ' + validProcessors.join(','));
          })
        }
      }
    }
  }, {
    underscored: true,
    tableName: 'gc_bsd_surveys',
    indexes: [
      { fields: ['signup_form_id'] },
    ],
    classMethods: {
      associate: (models) => {
        GCBSDSurvey.belongsTo(models.BSDSurvey, {
          foreignKey: 'signup_form_id',
          as: 'BSDSurvey',
          constraints: false
        })
      }
    },
    instanceMethods: {
      async process(surveyFields) {
        // TODO: Handle other processors
        if (this.processors.length === 0)
          return;
        if (!surveyFields['event_id'])
          throw new Error('Survey response must contain a field tagged with event_id to create RSVPs')
        let person = surveyFields['person']
        let email = await person.getPrimaryEmail();
        let address = await person.getPrimaryAddress();
        let zip = address.zip
        return BSDClient.addRSVPToEvent(email, zip, surveyFields['event_id'])
      }
    }
  })
  return GCBSDSurvey;
}