module.exports = {
  entry: './src/frontend/app.js',
  module: {
    loaders: [
      {
        exclude: /node_modules/,
        loader: 'babel',
        query: {stage: 0, plugins: ['./src/backend/babelRelayPlugin']},
        test: /\.js$/,
      }
    ]
  },
}