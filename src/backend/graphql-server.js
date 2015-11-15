import express from 'express';
import graphQLHTTP from 'express-graphql';
import {Schema} from './data/schema';
import writeSchema from './data/writeSchema';

writeSchema();
const GRAPHQL_PORT = process.env.GRAPHQL_PORT;

let graphQLServer = express();
graphQLServer.use('/', graphQLHTTP({schema: Schema, graphiql: true}));
graphQLServer.listen(GRAPHQL_PORT, () => console.log(
  `GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}`
));


