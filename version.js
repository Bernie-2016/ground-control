/* ~/www/project-x/version.js */
var Version = require("node-version-assets");
var versionInstance = new Version({
    assets: ['src/frontend/public/assets/js/app.js'],
    grepFiles: ['src/frontend/public/index.html']
});
versionInstance.run();