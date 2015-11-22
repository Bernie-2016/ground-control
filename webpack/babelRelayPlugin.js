var getbabelRelayPlugin = require('babel-relay-plugin');
var schema = require('/tmp/schema.json');

module.exports = getbabelRelayPlugin(schema.data);
