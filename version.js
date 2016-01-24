/* ~/www/project-x/version.js */
var fs = require('fs')
var Version = require("node-version-assets");
var mapReplacer = new Version({
    assets: ['src/frontend/public/assets/js/app.js.map'],
    grepFiles: ['src/frontend/public/assets/js/app.js']
})

mapReplacer.run(function() {
  // For some reason the map replacer doesn't work
  var newAppJsMapFile = null;
  var assets = fs.readdirSync('src/frontend/public/assets/js')
  assets.forEach(function(assetName) {
    if (assetName.match(/^app\.js\..*\.map$/))
      newAppJsMapFile = assetName
  })
  var appJsContents = fs.readFileSync('src/frontend/public/assets/js/app.js', 'utf8')

  var results = appJsContents.replace('app.js.map', newAppJsMapFile)
  fs.writeFileSync('src/frontend/public/assets/js/app.js', results, 'utf8')

  var assetReplacer = new Version({
    assets: ['src/frontend/public/assets/js/app.js'],
    grepFiles: ['src/frontend/public/index.html']
  });
  assetReplacer.run()
})