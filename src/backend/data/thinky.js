// This is an app singleton
let thinky = require('thinky')({
  enforce_missing: true,
  enforce_type: 'strict',
  authKey: process.env.DB_AUTHKEY
});
export default thinky