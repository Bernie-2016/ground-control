import BSDClient from '../../bsd-instance';
export default function(sequelize, DataTypes) {
  let GCBSDSurvey = sequelize.define('GCBSDSurvey', {
    renderer: {
      type: DataTypes.STRING,
      isIn: [['BSDSurvey', 'BSDEventSurvey']]
    },
    processors: {
      type: DataTypes.ARRAY(DataTypes.STRING),
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
    }
  })
  return GCBSDSurvey;
}