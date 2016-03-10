require('dotenv').load({path: './../.env'});
require('babel/register');

var chai = require('chai');

chai.config.includeStack = true;

global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;

module.exports = {
  frontend: {
    Test: require('./frontend')
  },
  backend: {
    Test: require('./backend'),
    BSD: require('../../src/backend/bsd-instance'),
    Knex: require('../../src/backend/data/knex')
  }
};