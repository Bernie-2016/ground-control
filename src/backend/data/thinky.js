// This is an app singleton
import thinky from 'thinky'
let sharedThinky = thinky({
  enforce_missing: true,
  enforce_type: 'strict',
  authKey: process.env.DB_AUTHKEY
});
export default sharedThinky;