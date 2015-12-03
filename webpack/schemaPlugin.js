function apply(options, compiler) {
  compiler.plugin('compile', function(params) {
    require('babel/register')({
      optional: ['es7.asyncFunctions']
    });
    require('../src/backend/data/writeSchema')();
  });
}

module.exports = function(options) {
  return {
    apply: apply.bind(this, options)
  }
}
