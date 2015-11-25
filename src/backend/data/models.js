import Sequelize from 'sequelize';
let sequelize = new Sequelize(
  process.env.POSTGRES_DBNAME,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    dialect: 'postgres'
  }
);

sequelize.beforeDefine('defaultModelAttributes', (model) => {
  console.log(model);
})

/*
For now, we are just wholesale copying models from BSD.  These models are partial versions of models in BSD. In the future, we may have other underlying sources for some of these models, at that point, we plan to migrate objects over into a more abstract architecture.  For now, if you need new properties on these models, if they map to existing columns in BSD, you can just add them without needing to do a migration.
*/
let commonBSDProps = {
  createApp: {
    type: Sequelize.STRING,
    field: 'create_app',
    allowNull: true
  },
  createUser: {
    type: Sequelize.STRING,
    field: 'create_user',
    alowNull: true
  },
  modifiedApp: {
    type: Sequelize.STRING,
    field: 'modified_app',
    allowNull: true
  },
  modifiedUser: {
    type: Sequelize.STRING,
    field: 'modified_user',
    allowNull: true
  },
  status: {
    type: Sequelize.BIGINT,
  },
  note: {
    type: Sequelize.STRING,
    allowNull: true
  }
}
export const Person = sequelize.define('person', {
  id: {
    type: Sequelize.BIGINT,
    field: 'cons_id',
    primaryKey: true
  },
  sourceID: {
    type: Sequelize.BIGINT,
    field: 'cons_source_id',
  },
  prefix: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  firstName: {
    type: Sequelize.STRING,
    field: 'firstname',
    allowNull: true
  },
  middleName: {
    type: Sequelize.STRING,
    field: 'middlename',
    allowNull: true
  },
  lastName: {
    type: Sequelize.STRING,
    field: 'lastname',
    allowNull: true
  },
  suffix: {
    type: Sequelize.STRING,
    allowNull: true
  },
  salutation: {
    type: Sequelize.STRING,
    allowNull: true
  },
  gender: {
    type: Sequelize.CHAR(1),
    allowNull: true
  },
  birthDate: {
    type: Sequelize.DATEONLY,
    field: 'birth_dt',
    allowNull: true
  },
  title: {
    type: Sequelize.STRING,
    allowNull: true
  },
  employer: {
    type: Sequelize.STRING,
    allowNull: true
  },
  occupation: {
    type: Sequelize.STRING,
    allowNull: true
  },
  income: {
    type: Sequelize.NUMERIC,
    allowNull: true
  },
  source: {
    type: Sequelize.STRING,
    allowNull: true
  },
  subsource: {
    type: Sequelize.STRING,
    allowNull: true
  },
  userid: {
    type: Sequelize.STRING,
    allowNull: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: true
  },
  isValidated: {
    type: Sequelize.BOOLEAN,
    field: 'is_validated'
  },
  isBanned: {
    type: Sequelize.BOOLEAN,
    field: 'is_banned'
  },
  changePasswordNextLogin: {
    type: Sequelize.BOOLEAN,
    field: 'change_password_next_login'
  },
  isDeleted: {
    type: Sequelize.BOOLEAN,
    allowNull: true
  },
  ...commonBSDProps
}, {
  updatedAt: 'modified_dt',
  createdAt: 'create_dt',
  underscored: true
})

export const Email = sequelize.define('email', {
  id: {
    type: Sequelize.BIGINT,
    field: 'cons_email_id',
    primaryKey: true
  },
  personId: {
    type: Sequelize.BIGINT,
    field: 'cons_id',
    references: {
      model: Person,
      key: 'id',
    }
  },
  emailTypeId: {
    type: Sequelize.BIGINT,
    field: 'cons_email_type_id',
  },
  isPrimary: {
    type: Sequelize.BOOLEAN,
    field: 'is_primary'
  },
  address: {
    type: Sequelize.STRING,
    unique: true,
    validate: {
      isEmail: true,
      isLowercase: true
    }
  },
  doubleValidation: {
    type: Sequelize.STRING,
    allowNull: true,
    field: 'double_validation'
  },
  ...commonBSDProps
}, {
  updatedAt: 'modified_dt',
  createdAt: 'create_dt',
  underscored: true
})

export const Phone = sequelize.define('phone', {
  id: {
    type: Sequelize.BIGINT,
    field: 'cons_phone_id',
    primaryKey: true
  },
  personId: {
    type: Sequelize.BIGINT,
    field: 'cons_id',
    references: {
      model: Person,
      key: 'id',
    }
  },
  phoneTypeId: {
    type: Sequelize.BIGINT,
    field: 'cons_phone_type_id',
    allowNull: true
  },
  isPrimary: {
    type: Sequelize.BOOLEAN,
    field: 'is_primary'
  },
  number: {
    type: Sequelize.STRING,
    field: 'phone',
    unique: true,
    validate: {
      isNumeric: true
    }
  },
  isUnsub: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
    field: 'isunsub'
  },
  ...commonBSDProps
}, {
  updatedAt: 'modified_dt',
  createdAt: 'create_dt',
  underscored: true
})

//export const Event = sequelize.define('Event', {
//  id: type.string().options({enforce_missing: false}),
//  BSDId: type.string().allowNull(true),
//  name: type.string().allowNull(true)
//})

/*export const CallAssignment = sequelize.define('call_assignment', {
  name: Sequelize.STRING,
}, {
  underscored: true
})

export const Group = sequelize.define('group', {
  BSDId: {
    type: Sequelize.INTEGER,
    field: 'cons_group_id',
  }
})

export const Survey = sequelize.define('survey', {
  BSDId: {
    type: Sequelize.INTEGER,
    field: 'signup_form_id'
  }
}, { underscored: true })

export const GroupCall = sequelize.define('group_call', {
  name: Sequelize.STRING,
  scheduledTime: Sequelize.DATE,
  maxSignups: Sequelize.INTEGER,
  duration: Sequelize.INTEGER,
  maestroConferenceUID: Sequelize.STRING,
  signups: [{
    personId: Sequelize.STRING,
    attended: Sequelize.BOOLEAN,
    role: Sequelize.ENUM(['host', 'note_taker', 'participant'])
  }]
})

CallAssignment.hasOne(Group, {as: 'callerGroup', foreignKey : 'callerGroupId'});
CallAssignment.hasOne(Group, {as: 'targetGroup', foreignKey : 'targetGroupId'});
Person.hasMany(Email, {as: 'emails'})
*/
