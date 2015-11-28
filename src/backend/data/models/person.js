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
      createFromBSDObject: (constituent) => {
        let newPerson = {...constituent}
        newPerson.firstName = newPerson.firstname;
        newPerson.lastName = newPerson.lastname;
        newPerson.middleName = newPerson.middlename;
        newPerson.birthDate = newPerson.birth_dt;
        newPerson.updatedAt = newPerson.modified_dt;
        newPerson.createdAt = newPerson.create_dt;
        return Person.create(newPerson);
      }
    }
  });

  return Person;
}