// This is an app singleton
var thinky = require('thinky')({
  enforce_missing: true,
//    enforce_extra: 'strict',
  enforce_type: 'strict',
  authKey: process.env.DB_AUTHKEY
});
export default thinky