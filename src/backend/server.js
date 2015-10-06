import express from 'express';
import { Schema } from './data/schema';
import graphQLHTTP from 'express-graphql';

const app = express();
app.use('/', graphQLHTTP({schema: Schema, pretty: true}));
app.listen(8000, (err) => {
  if (err)
    return console.error(err);
  console.log('GraphQL Server is now running on localhost:8000');
});

const static_app = express();
static_app.listen(9000, (err) => {
  if (err)
    return console.error(err);
  console.log('Static Server is now running on localhost:9000');
})
static_app.set('view engine', 'jade');
static_app.get('/create-group-call', function (req, res) {
  res.render('../src/backend/templates/createGroupCall', { title: 'Hey', message: 'Hello there!'});
});
