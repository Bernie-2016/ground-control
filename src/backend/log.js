import Minilog from 'minilog';
Minilog.enable()
  .pipe(Minilog.backends.console.formatWithStack)
  .pipe(Minilog.backends.console);

const log = Minilog('backend');
export default log;