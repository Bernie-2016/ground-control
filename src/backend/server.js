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

app.get('/events', function(req, res) {
  res.sendFile(publicPath + '/events/create_event.html');
});

app.post('/events', (req, res) => {

  var form = req.body;
  console.log(form);

  // let constituent_id = await BSDClient.fetchConstituent(form.cons_email);
  var constituent_id = BSDClient.fetchConstituent(form.cons_email, logCons);

  function logCons(result){
  	console.log(result);
  	if (result.api.cons){
  		res.send(result.api.cons.id);
  	}
  	else {
  		res.send("No constituent record found for email address " + form.cons_email);
  	}
  }
});

app.use(express.static(publicPath))
app.use(fallback('index.html', { root: publicPath }))
app.use('/graphql', graphQLHTTP({schema: Schema}));
app.listen(port, () => console.log(
  `Server is now running on http://localhost:${port}`
));