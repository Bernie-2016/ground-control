var acquit = require('acquit');
var fs = require('fs');
var path = require('path');
var files = [
  './tests/backend/bsd-instance_spec.js'
];

files.forEach(generateDocs);

function generateDocs(filePath){
  var pathname = path.basename(path.dirname(filePath));
  var isSub = false;
  if(pathname !== "test") isSub = true;

  var content = fs.
  readFileSync(filePath).toString();

  // Parse the contents of the test file into acquit 'blocks'
  var blocks = acquit.parse(content);
  var header = require('fs').readFileSync('./lib/tests/acquit/header.md').toString();

  var mdOutput = header + '\n\n';

// For each describe() block
  for (var i = 0; i < blocks.length; ++i) {
    var describe = blocks[i];
    mdOutput += '## ' + describe.contents + '\n\n';
    mdOutput += describe.comments[0] ?
    acquit.trimEachLine(describe.comments[0]) + '\n\n' :
      '';

    // This test file only has it() blocks underneath a
    // describe() block, so just loop through all the
    // it() calls.
    for (var j = 0; j < describe.blocks.length; ++j) {
      var it = describe.blocks[j];
      mdOutput += '#### It ' + it.contents + '\n\n';
      mdOutput += it.comments[0] ?
      acquit.trimEachLine(it.comments[0]) + '\n\n' :
        '';
      mdOutput += '```javascript\n';
      mdOutput += '    ' + it.code + '\n';
      mdOutput += '```\n\n';
    }
  }

  if(!isSub)
    require('fs').writeFileSync('./src/README.md', mdOutput);
  else
    require('fs').writeFileSync('./src/'+pathname+'/README.md', mdOutput);


}