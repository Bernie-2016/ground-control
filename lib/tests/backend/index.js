//Setup test defaults
var BackEndTest = function BackEndTest(fn) {
  this.config = {
    host: process.env.APP_HOST,
    port: process.env.WEBPACK_PORT,
    adminLogin: {
      email: "admin@localhost.com",
      password: "admin"
    }
  };

  return fn(this);
};


BackEndTest.prototype.expect = require('chai').Expect;

module.exports = BackEndTest;