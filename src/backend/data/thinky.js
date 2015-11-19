// This is an app singleton
import thinky from 'thinky'
let sharedThinky = thinky({
  enforce_missing: true,
  enforce_type: 'strict',
  authKey: process.env.DB_AUTHKEY,
  host: process.env.RETHINK_HOST || "localhost",
  port: process.env.RETHINK_PORT || "28015"
});
export default sharedThinky;
