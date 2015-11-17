import express from 'express';
import graphQLHTTP from 'express-graphql';
import {Schema} from './data/schema';
import writeSchema from './data/writeSchema';
import path from 'path';
import fallback from 'express-history-api-fallback';
import bodyParser from 'body-parser';
import BSD from './bsd';
writeSchema();

const BSDClient = new BSD(process.env.BSD_HOST, process.env.BSD_API_ID, process.env.BSD_API_SECRET);
const port = process.env.APP_PORT;
const app = express();
const publicPath = path.resolve(__dirname, '../frontend/public');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// this endpoint is strictly for debugging
app.get('/events/types.json', async (req, res) => {
  let result = await BSDClient.getEventTypes();
  // res.send('<pre>' + JSON.stringify(result2, null, 2) + '</pre>');
  res.json(result);
});

app.get('/events', function(req, res) {
  res.sendFile(publicPath + '/events/create_event.html');
});

app.post('/events', async (req, res) => {
  var form = req.body;

  var result = await BSDClient.fetchConstituent(form.cons_email);

  if (result.api.cons){
  	console.log('constituent found')
  	var constituent_id = result.api.cons.id;
  }
  else {
  	console.log('creating constituent...')
  	result = await BSDClient.createConstituent(form.cons_email);
  	var constituent_id = result.api.cons.id;
  }

  let status = await BSDClient.createEvents(constituent_id, form);
  res.send(status);
});

app.use(express.static(publicPath))
app.use(fallback('index.html', { root: publicPath }))
app.use('/graphql', graphQLHTTP({schema: Schema}));
app.listen(port, () => console.log(
  `Server is now running on http://localhost:${port}`
));