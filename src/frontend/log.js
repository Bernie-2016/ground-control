import Minilog from 'minilog';
Minilog.enable()

const log = Minilog('client')
let existingErrorLogger = log.error
log.error = function() {
  Rollbar.error(...arguments)
  existingErrorLogger(...arguments)
}
export default log;