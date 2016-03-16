require('dotenv').load({path: '.env'});

//Setup test defaults
var FrontEndTest = function FrontEndTest(fn) {
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

FrontEndTest.prototype.getUrl = function getUrl(){
  return 'http://' + this.config.host + ':' + this.config.port;
};

/**
 * Screenshot Helper
 * creates screenshots from an array of widths
 * @param browser
 */
FrontEndTest.prototype.takeScreenshots = function takeScreenshots(browser, testName) {
  var save_directory,
    viewport_widths = [240, 320, 360, 568, 603, 640, 768, 800, 960, 1024, 1280, 1400, 1600, 1920],
    viewport_height = 1024;

  if (typeof testName !== "undefined")
    save_directory = browser.screenshotsPath + '/' + testName;
  else
    save_directory = browser.screenshotsPath + '/noname';


  //Take screenshots of each of the viewport_widths specified
  viewport_widths.forEach(function (width) {
    browser
      .resizeWindow(width, viewport_height)
      .saveScreenshot(save_directory + '-' + width + 'x' + viewport_height + '.png')
  });
};

/**
 * Login Helper
 * @param browser
 * @param nextRoute
 * @param user
 * @param screenshots
 * @param screenshotLabel
 */
FrontEndTest.prototype.autoLogin = function autoLogin(browser, nextRoute, user, screenshots, screenshotLabel) {
  var creds, currentRouteUrl;

  if (user.email && user.password) {
    creds = user;
  } else if (typeof user === "undefined") {
    creds = {
      email: 'admin@localhost.com',
      password: 'admin'
    }
  }

  if (typeof nextRoute !== "undefined") {
    currentRouteUrl = this.getUrl() + '/' + nextRoute
  } else {
    currentRouteUrl = this.getUrl();
  }

  // /Start the browser
  browser.url(currentRouteUrl)
    .waitForElementVisible('body', 1000)

    //Enter Email
    .assert.visible('input[name=email]')
    .setValue('input[name=email]', creds.email)
    //Enter Password
    .assert.visible('input[name=password]')
    .setValue('input[name=password]', creds.password);

  //Take screenshots of login screen
  if (typeof screenshots !== "undefined" && screenshots) {
    this.takeScreenshots(browser, screenshotLabel)
  }

  //Login
  browser.waitForElementVisible('button[value=submit]', 1000)
    .click('button[value=submit]')
    .pause(2000);

};

module.exports = FrontEndTest;