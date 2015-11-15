import express from 'express';
import graphQLHTTP from 'express-graphql';
import {Schema} from './data/schema';
import writeSchema from './data/writeSchema';
writeSchema();

const port = process.env.PORT;

let app = express();
app.use('/', graphQLHTTP({schema: Schema, graphiql: true}));
app.listen(port, () => console.log(
  `Server is now running on http://localhost:${port}`
));