var SchemaPlugin = require('./schemaPlugin')
var webpack = require('webpack')

var plugins = [
  new SchemaPlugin(),
]

if (process.env.NODE_ENV === 'production')
  plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true}))
module.exports = {
  entry: './src/frontend/app.js',
  module: {
    loaders: [
      { test: /\.json$/, loader: 'json'},
      { test: /\.css$/, loader: "style!css" },
      {
        exclude: /node_modules/,
        loader: 'babel',
        query: {stage: 0, plugins: ['./webpack/babelRelayPlugin']},
        test: /\.js$/,
      }
    ]
  },
  plugins: plugins,
  output: {
    filename: 'app.js',
    path: './src/frontend/public/assets/js/'},
  devtool: "#inline-source-map"
}
