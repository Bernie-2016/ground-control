import express from 'express';
import graphQLHTTP from 'express-graphql';
import {Schema} from './data/schema';
import writeSchema from './data/writeSchema';
import httpProxy from 'http-proxy';
import path from 'path';
writeSchema();

const proxy = httpProxy.createProxyServer();
const port = process.env.PORT;
const isProduction = process.env.NODE_ENV === 'production';
const publicPath = path.resolve(__dirname, '../frontend/public');

let app = express();
app.use('/graphql', graphQLHTTP({schema: Schema, graphiql: true}));
app.use('/', express.static(publicPath));
if (!isProduction) {
  app.all('/public/*', (req, res)  => {
    proxy.web(req, res, {
        target: `http://localhost:${process.env.WEBPACK_SERVER_PORT}`
    });
  });
}
app.listen(port, () => console.log(
  `Server is now running on http://localhost:${port}`
));