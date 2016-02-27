var SchemaPlugin = require('./schemaPlugin')
var webpack = require('webpack')

var plugins = [
  new SchemaPlugin(),
]

if (process.env.NODE_ENV === 'production')
  plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true}))

var config = {
  entry: './src/frontend/app.js',
  module: {
    noParse: [/node_modules\/quill\/dist\/quill\.js/, /node_modules\/google-libphonenumber\/dist/],
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
    path: './src/frontend/public/assets/js/'
  },
  externals: {
    // define newrelic as an external library
    // http://webpack.github.io/docs/configuration.html#externals
    newrelic: true
  }
}

if (process.env.NODE_ENV === 'development') {
  config['devtool'] = "#inline-source-map";
} else if (process.env.NODE_ENV === 'production') {
  config['devtool'] = 'source-map';
}

module.exports = config
