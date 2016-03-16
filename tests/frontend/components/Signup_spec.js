var Base = require('./../../Base');
var FrontEndTest = Base.frontend.Test;

/**
 * Automated Browser Tests
 */
module.exports = new FrontEndTest(function (Test) {
  return {
    /**
     * Call route as Admin
     * @param browser
     * @constructor
     */
    "Login to Call route as Admin": function (browser) {
      Test.autoLogin(browser, 'call', Test.config.adminLogin, true, "call/1-login");
      Test.takeScreenshots(browser, 'call/2-call');

      browser.end();
    },

    /**
     * Admin route as Admin
     * @param browser
     * @constructor
     */
    "Login to Admin route as Admin": function (browser) {

      Test.autoLogin(browser, 'admin', Test.config.adminLogin);


      browser.waitForElementVisible('button[tabindex="1"]', 1000);

      Test.takeScreenshots(browser, 'admin/2-index');

      browser.click('button[tabindex="1"]')
        .pause(2000)

      //Take screenshots of call screen
      Test.takeScreenshots(browser, 'admin/3-events');

      browser.end();
    }
  }
});


