var Base = require('./../../Base');
var FrontEndTest = Base.frontend.Test;
var BSDClient = Base.backend.BSD;
var knex = Base.backend.Knex;

/**
 * Automated Browser Tests
 */
module.exports = new FrontEndTest(function (Test) {
  //var testUsers = [
  //  {
  //    email: "one@example.com",
  //    password: "one"
  //  },
  //  {
  //    email: "two@example.com",
  //    password: "two"
  //  },
  //  {
  //    email: "three@example.com",
  //    password: "three"
  //  }
  //
  //];


  return {
    before: function (done) {
      //Add test users to BSD and ground-control!
      //knex('users')
      //  .where('email', testUsers[0].email)
      //  .orWhere('email', testUsers[1].email)
      //  .orWhere('email', testUsers[2].email)
      //  .del()
      //  .then(function(){
      //    knex.insert('users', {
      //      email: email.toLowerCase(),
      //      password: hashedPassword
      //    });
      //    done();
      //  });
    }//,

    //"If BSD constituent does not exist, create a new BSD constituent AND ground-control user with those credentials": function (browser) {
    //  Test.autoLogin(browser, 'call', Test.config.adminLogin, true, "call/1-login");
    //  Test.takeScreenshots(browser, 'call/2-call');
    //
    //  browser.end();
    //},
    //"If same credentials, create a new ground-control user with those credentials": function (browser) {
    //  Test.autoLogin(browser, 'call', Test.config.adminLogin, true, "call/1-login");
    //  Test.takeScreenshots(browser, 'call/2-call');
    //
    //  browser.end();
    //},
    //"If account credentials are correct but the password for ground-control is incorrect, update the ground-control password and log in": function (browser) {
    //  Test.autoLogin(browser, 'call', Test.config.adminLogin, true, "call/1-login");
    //  Test.takeScreenshots(browser, 'call/2-call');
    //
    //  browser.end();
    //},
    //"If BSD credentials are incorrect, give error message with a link to reset password via BSD": function (browser) {
    //  Test.autoLogin(browser, 'call', Test.config.adminLogin, true, "call/1-login");
    //  Test.takeScreenshots(browser, 'call/2-call');
    //
    //  browser.end();
    //}
  }
});


