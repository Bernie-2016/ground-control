var getbabelRelayPlugin = require('babel-relay-plugin');
var schema = require('../src/backend/data/schema.json');

module.exports = getbabelRelayPlugin(schema.data);