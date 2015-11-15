import express from 'express';
import graphQLHTTP from 'express-graphql';
import {Schema} from './data/schema';
import writeSchema from './data/writeSchema';
import proxyMiddleware from 'http-proxy-middleware';
import path from 'path';
writeSchema();

const port = process.env.PORT;
const isProduction = process.env.NODE_ENV === 'production';
const publicPath = path.resolve(__dirname, '../frontend/public');

let app = express();
app.use('/graphql', graphQLHTTP({schema: Schema, graphiql: true}));
app.use('/', express.static(publicPath));
if (!isProduction) {
  let path = '/public';
  let options = {
    target: `http://localhost:${process.env.WEBPACK_SERVER_PORT}`,
    ws: true,
    pathRewrite: {
        '^/public' : '/'
    },
  };
  let proxy = proxyMiddleware(path, options);
  app.use(proxy);
}
app.listen(port, () => console.log(
  `Server is now running on http://localhost:${port}`
));