import WebpackDevServer from 'webpack-dev-server';
import path from 'path';
import webpack from 'webpack';

const port = process.env.WEBPACK_SERVER_PORT

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
  contentBase: '/public/',
  publicPath: '/',
  stats: {colors: true}
});

app.listen(port, () => {
  console.log(`Webpack dev server is now running on http://localhost:${port}`);
});