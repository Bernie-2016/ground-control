import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import configOpts from '../config/config';

let basename  = path.basename(module.filename);
let env       = process.env.NODE_ENV || 'development';
let db        = {};
let sequelize = null;
let config = configOpts[env];

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
  sequelize = new Sequelize(config.url);
}

sequelize.beforeDefine('defaultAttributes', (attrs) => {
  Object.keys(attrs).forEach((key) => {
    if (typeof attrs[key]['allowNull'] === 'undefined')
      attrs[key]['allowNull'] = false;
    if (typeof attrs[key]['validate'] === 'undefined')
      attrs[key]['validate'] = {};
    if (typeof attrs[key]['validate']['notEmpty'] === 'undefined')
      attrs[key]['validate']['notEmpty'] = true
  })
})

fs
  .readdirSync(__dirname)
  .filter((file) => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach((file) => {
    let model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
