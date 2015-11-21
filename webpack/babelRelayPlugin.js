var fs = require('fs')
var path = require('path')
var retry = require('retry')
var getbabelRelayPlugin = require('babel-relay-plugin');
var schemaPath = path.join('/','tmp','schema.json')

module.exports = function(content) {
  var callback = this.async();

  // Sync will fail ocassionaly due to race conditions with the database
  if(!callback) {
    // Attempt to read schema.json for sync calls
    var schema = fs.readFileSync(schemaPath,'utf8');

    // Attempt to get schema.data or crash
    return getbabelRelayPlugin(resolveSchemaData(schema));
  }
  var readSchema = retry.operation();

  // Attempt to connect to the database, 10 retries with exponential backoff
  readSchema.attempt(function(currentAttempt) {
    fs.readFile(schemaPath,'utf8',function(e,data) {
      if(readSchema.retry(e)) {
        // let retry do its thing
        return;
      }

      // If we are out of retries and still encounter an error, terminate
      if(e) {
        console.error("Unable to read schema.json")
        console.error(e.stack)
        return process.exit(1)
      }

      // otherwise, attempt to get schema.data and return
      callback(null, getbabelRelayPlugin(resolveSchemaData(data)));
    });
  });
}

/*
 * Resolve schema data attempts to parse the contents of schema
 * as JSON. The process crashes if it is malformed, otherwise we
 * return schema.data
 */
function resolveSchemaData(schema) {
  try {
    schema = JSON.parse(schema);
    return schema.data;
  } catch(e) {
    console.error("Malformed schema.json");
    console.error(e.stack);
    return process.exit(1);
  }
}
