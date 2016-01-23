import Minilog from 'minilog';
if (process.env.ROLLBAR_ACCESS_TOKEN) {
  var rollbar = require('rollbar')
  rollbar.init(process.env.ROLLBAR_ACCESS_TOKEN)
}

Minilog.suggest.deny(/.*/, process.env.NODE_ENV === 'development' ? 'debug' : 'debug')

Minilog.enable()
  .pipe(Minilog.backends.console.formatWithStack)
  .pipe(Minilog.backends.console)

const log = Minilog('backend');
let existingErrorLogger = log.error
log.error = function(err) {
  if (rollbar) {
    if (typeof err === 'object')
      rollbar.handleError(err)
    else if (typeof err === 'string')
      rollbar.reportMessage(err)
    else
      rollbar.reportMessage('Got backend error with no error message')
  }
  existingErrorLogger(err ? err.toString() : err)
}
export default log;