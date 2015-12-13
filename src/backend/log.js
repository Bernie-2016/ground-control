import Minilog from 'minilog';

Minilog.suggest.deny(/.*/, process.env.NODE_ENV === 'development' ? 'debug' : 'info')

Minilog.enable()
  .pipe(Minilog.backends.console.formatWithStack)
  .pipe(Minilog.backends.console)

const log = Minilog('backend');
export default log;