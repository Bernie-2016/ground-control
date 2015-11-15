import express from 'express';
import graphQLHTTP from 'express-graphql';
import {Schema} from './data/schema';
import writeSchema from './data/writeSchema';
import path from 'path'
import fallback from 'express-history-api-fallback'
writeSchema();

const port = process.env.APP_PORT;
const app = express();
const publicPath = path.resolve(__dirname, '../frontend/public');
app.use(express.static(publicPath))
app.use(fallback('index.html', { root: publicPath }))
app.use('/graphql', graphQLHTTP({schema: Schema}));
app.post('/events', (req, resp) => {
  console.log('hi');
})
app.listen(port, () => console.log(
  `Server is now running on http://localhost:${port}`
));