module.exports = {
  entry: './src/frontend/app.js',
  module: {
    loaders: [
      {
        exclude: /node_modules/,
        loader: 'babel',
        query: {stage: 0, plugins: ['./webpack/babelRelayPlugin']},
        test: /\.js$/,
      }
    ]
  },
  output: {filename: 'app.js', path: './src/frontend/public/js/'}
}