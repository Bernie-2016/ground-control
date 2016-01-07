let Transform = require('minilog').Transform

function RollbarMinilogBackend() {
  return this
}

Transform.mixin(RollbarMinilogBackend)

MinilogAirbrake.prototype.write = function(name, level, args) {



}
