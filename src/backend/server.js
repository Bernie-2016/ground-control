import express from 'express';
import graphQLHTTP from 'express-graphql';
import {Schema} from './data/schema';
import writeSchema from './data/writeSchema';
import path from 'path';
import fallback from 'express-history-api-fallback';
import bodyParser from 'body-parser';
import BSD from './bsd';
import MG from './mail';
import demoData from './data/demo.json';
writeSchema();

const Mailgun = new MG(process.env.MAILGUN_KEY, process.env.MAILGUN_DOMAIN);
const BSDClient = new BSD(process.env.BSD_HOST, process.env.BSD_API_ID, process.env.BSD_API_SECRET);
const port = process.env.APP_PORT;
const app = express();
const publicPath = path.resolve(__dirname, '../frontend/public');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// this endpoint may be used for caching and serving available event types and their attributes to the event creation form
app.get('/events/types.json', async (req, res) => {
  let result = await BSDClient.getEventTypes();
  console.log(result);
  res.json(result);
});

// this endpoint is for testing email rendering/sending
app.get('/events/confirmation-email', async (req, res) => {
  let event_types = await BSDClient.getEventTypes();
  let result = await Mailgun.sendEventConfirmation(demoData.EventCreationForm, demoData.EventCreationConstituent, event_types, true);
  res.send(result.html)
  // res.json(result);
});

app.get('/events/create', (req, res) => {
  res.sendFile(publicPath + '/events/create_event.html');
});

app.post('/events/create', async (req, res) => {
  let form = req.body;

  // constituent object not being returned right now
  let constituent = await BSDClient.getConstituentByEmail(form.cons_email);

  if (!constituent){
  	console.log('creating constituent...');
    constituent = await BSDClient.createConstituent(form.cons_email);
  }

  let event_types = await BSDClient.getEventTypes();

  let result = await BSDClient.createEvents(constituent.id, form, event_types);
  res.json(result);

  // send event creation confirmation email
  if (result == 'success'){
  	Mailgun.sendEventConfirmation(form, constituent, event_types);
  }
});

app.use(express.static(publicPath))
app.use(fallback('index.html', { root: publicPath }))
app.use('/graphql', graphQLHTTP({schema: Schema}));
app.listen(port, () => console.log(
  `Server is now running on http://localhost:${port}`
));

app.use((e,req,res,next) => {
  e = e || new Error("Reached end of the middleware stack with no response")
  console.error(e)
  console.error(e.stack)
  res.status(500).end()
});
