export default function(sequelize, DataTypes) {
  let BSDPerson = sequelize.define('BSDPerson', {
    id: {
      type: DataTypes.INTEGER,
      field: 'cons_id',
      primaryKey: true
    },
    prefix: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    firstName: {
      type: DataTypes.STRING,
      field: 'firstname',
      allowNull: true
    },
    middleName: {
      type: DataTypes.STRING,
      field: 'middlename',
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      field: 'lastname',
      allowNull: true
    },
    suffix: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gender: {
      type: DataTypes.CHAR(1),
      allowNull: true
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      field: 'birth_dt',
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    employer: {
      type: DataTypes.STRING,
      allowNull: true
    },
    occupation: {
      type: DataTypes.STRING,
      allowNull: true
    },
  }, {
    updatedAt: 'modified_dt',
    createdAt: 'create_dt',
    underscored: true,
    tableName: 'bsd_people',
    instanceMethods: {
      getCached(property) {
        let functionName = 'get' + property[0].toUpperCase() + property.slice(1);
        let value = this.getDataValue(property);
        return value ? value : this[functionName]();
      },
      async getPrimaryEmail() {
        let emails = await this.getCached('emails')
        let email = emails[0].email
        emails.forEach((emailObj) => {
          if (emailObj.isPrimary)
            email = emailObj.email;
        })
        return email;
      },
      async getPrimaryAddress() {
        let addresses = await this.getCached('addresses')
        let address = addresses[0].address
        addresses.forEach((addressObj) => {
          if (addressObj.isPrimary)
            address = addressObj;
        })
        return address;
      },
      async getPrimaryPhone() {
        let phones = await this.getCached('phones')
        let phone = phones[0].phone
        phones.forEach((phoneObj) => {
          if (phoneObj.isPrimary)
            phone = phoneObj.phone;
        })
        return phone;
      }
    },
    classMethods: {
      associate: (models) => {
        BSDPerson.hasMany(models.BSDEmail, {
          foreignKey: 'cons_id',
          as: 'emails',
          constraints: false
        })
        BSDPerson.hasMany(models.BSDPhone, {
          foreignKey: 'cons_id',
          as: 'phones',
          constraints: false
        })
        BSDPerson.hasMany(models.BSDAssignedCall, {
          foreignKey: 'interviewee_id',
          as: 'assignedCalls',
          constraints: false
        })
        BSDPerson.hasMany(models.BSDCall, {
          foreignKey: 'interviewee_id',
          as: 'calls',
          constraints: false
        })
        BSDPerson.hasMany(models.BSDAddress, {
          foreignKey: 'cons_id',
          as: 'addresses',
          constraints: false
        })
        BSDPerson.hasMany(models.BSDEventAttendee, {
          foreignKey: 'attendee_cons_id',
          as: 'eventAttendances',
          constraints: false
        })
        BSDPerson.belongsToMany(models.GCBSDGroup, {
          through: models.BSDPersonGCBSDGroup,
          foreignKey: 'cons_id',
          as: 'groups',
          constraints: false
        });
      },
      createFromBSDObject: async (BSDObject) => {
        let newPerson = {...BSDObject}
        newPerson.firstName = newPerson.firstname;
        newPerson.lastName = newPerson.lastname;
        newPerson.middleName = newPerson.middlename;
        newPerson.birthDate = newPerson.birth_dt;
        let person = await BSDPerson.findById(newPerson.id)
        if (person) {
          let id = newPerson.id;
          delete newPerson.id;
          let updated = await BSDPerson.update(newPerson, {
            where: {
              id: id
            }
          });
          return BSDPerson.findById(id);
        }
        else
          return BSDPerson.create(newPerson);

        // This breaks because of but this is what we should be doing https://github.com/sequelize/sequelize/issues/4755
        //let person = await Person.upsert(newPerson);
        //return person
      }
    }
  });

  return BSDPerson;
}