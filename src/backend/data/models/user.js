import Promise from 'bluebird';
import bcrypt from 'bcrypt';

let hash = (password, salt) => {
  salt = salt || 10
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) return reject(err)
      resolve(hash)
    })
  })
}

let compare = (expected, hash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(expected, hash, (err, res) => {
      if (err) return reject(err)
      resolve(res)
    })
  })
}

export default function(sequelize, DataTypes) {
  let User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: true
      },
      set: function(val) {
        this.setDataValue('email', val.toLowerCase());
      }
    },
    password: DataTypes.STRING,
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_admin'
    },
    resetToken: {
      type: DataTypes.CHAR,
      length: 36,
      field: 'reset_token',
      allowNull: true
    }
  }, {
    underscored: true,
    tableName: 'users',
    updatedAt: 'modified_dt',
    createdAt: 'create_dt',
    instanceMethods: {
      verifyPassword: function(password) {
        return compare(password, this.password)
      }
    },
    classMethods: {
      associate: (models) => {
        User.hasMany(models.BSDAssignedCall, {
          as: 'assignedCalls',
          foreignKey: 'caller_id'
        })
      }
    }
  })

  let hashPassword = async (user, options) => {
    return hash(user.password, 8).then((res) => {
      user.setDataValue('password',res);
    })
  }

  User.beforeCreate(hashPassword);
  User.beforeUpdate(hashPassword);

  return User;
}
