//TODO add more tests as far as assert/expects
describe('Basic BSDClient Test', function(){
  it('should be able to instantiate the BSDClient', function(done){
    this.timeout(20000);
    var BSDClient = require('./../Base').backend.BSD;
    done();
  });
});