export default function(sequelize, DataTypes) {
  let Person = sequelize.define('Person', {
    id: {
      type: DataTypes.BIGINT,
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
      allowNull: true
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
    tableName: 'bsd_cons',
    classMethods: {
      associate: (models) => {
        Person.hasMany(models.Email, { foreignKey: 'cons_id'})
        Person.hasMany(models.Phone, { foreignKey: 'cons_id'})
      },
      createFromBSDObject: async (constituent) => {
        let newPerson = {...constituent}
        newPerson.firstName = newPerson.firstname;
        newPerson.lastName = newPerson.lastname;
        newPerson.middleName = newPerson.middlename;
        newPerson.birthDate = newPerson.birth_dt;

        // Set these
//        delete newPerson.modified_dt;
//        delete newPerson.create_dt;
//        delete newPerson.cons_id;
//        newPerson.updatedAt = newPerson.modified_dt);
//        newPerson.createdAt = newPerson.create_dt;

        let person = await Person.findById(newPerson.id)
        if (person) {
          let id = newPerson.id;
          delete newPerson.id;
          let updated = await Person.update(newPerson, {
            where: {
              id: id
            }
          });
          return Person.findById(id);
        }
        else
          return Person.create(newPerson);

        // This breaks because of but this is what we should be doinghttps://github.com/sequelize/sequelize/issues/4755
        //let person = await Person.upsert(newPerson);
        //return person
      }
    }
  });

  return Person;
}