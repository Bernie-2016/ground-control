// This is an app singleton
var thinky = require('thinky')({
  enforce_missing: true,
//    enforce_extra: 'strict',
  enforce_type: 'strict'
});
export default thinky