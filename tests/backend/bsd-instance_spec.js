//TODO add more tests as far as assert/expects
describe('Basic BSDClient Test', function(){
  it('should be able to instantiate the BSDClient', function(done){
    var BSDClient = require('./../Base');
    if(BSDClient) done();
  });
});