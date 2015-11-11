import WebpackDevServer from 'webpack-dev-server';
import path from 'path';
import webpack from 'webpack';
import express from 'express';

const APP_PORT = process.env.APP_PORT

// Serve the Relay app
let compiler = webpack({
  entry: path.resolve(__dirname, '../frontend', 'app.js'),
  module: {
    loaders: [
      {
        exclude: /node_modules/,
        loader: 'babel',
        query: {stage: 0, plugins: ['./babelRelayPlugin']},
        test: /\.js$/,
      }
    ]
  },
  output: {filename: 'app.js', path: '/'}
});

let app = new WebpackDevServer(compiler, {
  contentBase: '/static/',
  proxy: {'/graphql': `http://localhost:${process.env.GRAPHQL_PORT}`},
  publicPath: '/static/',
  stats: {colors: true}
});

// Serve static resources
app.use('/', express.static(path.resolve(__dirname, '../frontend/static')));
app.listen(APP_PORT, () => {
  console.log(`App is now running on http://localhost:${APP_PORT}`);
});