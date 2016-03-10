# Frontend Test Module


#### Example Test:
```javascript
var FrontEndTest = require('./lib/tests').frontend.Test;

/**
 * Automated Browser Tests
 */
module.exports = new FrontEndTest(function(Test){

  //Setup Requirements here
  Test.createBSDUser(fancy!)


  //Return your nightwatch test!
  return {
      "My Fancy End-End Test" : function (browser) {
        // Logging in and redirecting to the call route
        Test.autoLogin(browser, 'call', Test.config.adminLogin, true, "call/1-login" );
       
        //Should be on the call route
        browser
          .expect('things to be here')
          .expect('other things to be here')
        
        Test.takeScreenshots(browser, 'call/2-call');
    
        browser.end();
      }
  }
});
```