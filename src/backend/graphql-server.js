import express from 'express';
import graphQLHTTP from 'express-graphql';
import {Schema} from './data/schema';

const GRAPHQL_PORT = process.env.GRAPHQL_PORT;

var graphQLServer = express();
graphQLServer.use('/', graphQLHTTP({schema: Schema, graphiql: true}));
graphQLServer.listen(GRAPHQL_PORT, () => console.log(
  `GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}`
));


