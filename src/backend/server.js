import express from 'express';
import graphQLHTTP from 'express-graphql';
import {Schema} from './data/schema';
import writeSchema from './data/writeSchema';
import path from 'path';
import fallback from 'express-history-api-fallback';
import bodyParser from 'body-parser';
import BSD from './bsd';
import MG from './mail';
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
  res.json(result);
});

// this endpoint is for testing email rendering/sending
app.get('/events/confirmation-email', async (req, res) => {
  let form = {
  	is_searchable: '-2',
    event_type_id: '36',
    name: 'Rally for Bernie',
    description: '<p><u><strong>What is Lorem Ipsum?</strong></u></p><p><em>Lorem Ipsum</em> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
    host_receive_rsvp_emails: '1',
    attendee_volunteer_show: '1',
    attendee_volunteer_message: 'If you\'d like to help with the event, please sign up as a volunteer. Thanks!',
    rsvp_use_reminder_email: '1',
    rsvp_email_reminder_hours: '24',
    start_tz: 'US/Eastern',
    event_repeat_type: 'weekly',
    repeat_duration_num: '1',
    repeat_duration_unit: '30',
    start_time: { h: '9', i: '15', a: 'am' },
    duration_num: '3',
    duration_unit: '60',
    venue_country: 'US',
    venue_addr1: '725 5th Avenue',
    venue_addr2: '',
    venue_city: 'New York',
    venue_state_cd: 'NY',
    venue_zip: '10022',
    venue_name: 'Trump Tower',
    capacity: '500',
    venue_directions: 'These are directions to the event.',
    contact_phone: '(212) 832-2000',
    public_phone: '1',
    cons_email: 'me@example.com',
    event_dates: '[{"date":"2015-11-20","title":"Test Event Title","location":"","auto_generated":false,"moment":"2015-11-20T08:00:00.000Z","_clndrStartDateObject":"2015-11-20T08:00:00.000Z","_clndrEndDateObject":"2015-11-20T08:00:00.000Z"},{"date":"2015-11-18","title":"Test Event Title","location":"","auto_generated":false,"moment":"2015-11-18T08:00:00.000Z","_clndrStartDateObject":"2015-11-18T08:00:00.000Z","_clndrEndDateObject":"2015-11-18T08:00:00.000Z"},{"date":"2015-12-31","title":"","location":"","auto_generated":false,"moment":"2015-12-31T08:00:00.000Z","_clndrStartDateObject":"2015-12-31T08:00:00.000Z","_clndrEndDateObject":"2015-12-31T08:00:00.000Z"},{"date":"2015-11-27","title":"Test Event Title","location":"","auto_generated":true,"moment":"2015-11-27T08:00:00.000Z","_clndrStartDateObject":"2015-11-27T08:00:00.000Z","_clndrEndDateObject":"2015-11-27T08:00:00.000Z"},{"date":"2015-12-04","title":"Test Event Title","location":"","auto_generated":true,"moment":"2015-12-04T08:00:00.000Z","_clndrStartDateObject":"2015-12-04T08:00:00.000Z","_clndrEndDateObject":"2015-12-04T08:00:00.000Z"},{"date":"2015-12-11","title":"Test Event Title","location":"","auto_generated":true,"moment":"2015-12-11T08:00:00.000Z","_clndrStartDateObject":"2015-12-11T08:00:00.000Z","_clndrEndDateObject":"2015-12-11T08:00:00.000Z"},{"date":"2015-12-18","title":"Test Event Title","location":"","auto_generated":true,"moment":"2015-12-18T08:00:00.000Z","_clndrStartDateObject":"2015-12-18T08:00:00.000Z","_clndrEndDateObject":"2015-12-18T08:00:00.000Z"},{"date":"2015-11-25","title":"Test Event Title","location":"","auto_generated":true,"moment":"2015-11-25T08:00:00.000Z","_clndrStartDateObject":"2015-11-25T08:00:00.000Z","_clndrEndDateObject":"2015-11-25T08:00:00.000Z"},{"date":"2015-12-02","title":"Test Event Title","location":"","auto_generated":true,"moment":"2015-12-02T08:00:00.000Z","_clndrStartDateObject":"2015-12-02T08:00:00.000Z","_clndrEndDateObject":"2015-12-02T08:00:00.000Z"},{"date":"2015-12-09","title":"Test Event Title","location":"","auto_generated":true,"moment":"2015-12-09T08:00:00.000Z","_clndrStartDateObject":"2015-12-09T08:00:00.000Z","_clndrEndDateObject":"2015-12-09T08:00:00.000Z"},{"date":"2015-12-16","title":"Test Event Title","location":"","auto_generated":true,"moment":"2015-12-16T08:00:00.000Z","_clndrStartDateObject":"2015-12-16T08:00:00.000Z","_clndrEndDateObject":"2015-12-16T08:00:00.000Z"},{"date":"2016-01-07","title":"Test Event Title","location":"","auto_generated":true,"moment":"2016-01-07T08:00:00.000Z","_clndrStartDateObject":"2016-01-07T08:00:00.000Z","_clndrEndDateObject":"2016-01-07T08:00:00.000Z"},{"date":"2016-01-14","title":"Test Event Title","location":"","auto_generated":true,"moment":"2016-01-14T08:00:00.000Z","_clndrStartDateObject":"2016-01-14T08:00:00.000Z","_clndrEndDateObject":"2016-01-14T08:00:00.000Z"},{"date":"2016-01-21","title":"Test Event Title","location":"","auto_generated":true,"moment":"2016-01-21T08:00:00.000Z","_clndrStartDateObject":"2016-01-21T08:00:00.000Z","_clndrEndDateObject":"2016-01-21T08:00:00.000Z"},{"date":"2016-01-28","title":"Test Event Title","location":"","auto_generated":true,"moment":"2016-01-28T08:00:00.000Z","_clndrStartDateObject":"2016-01-28T08:00:00.000Z","_clndrEndDateObject":"2016-01-28T08:00:00.000Z"}]'
  };
  let result = await Mailgun.sendEventConfirmation(form);
  res.send(result.html)
  // res.json(result);
});

app.get('/events', (req, res) => {
  res.sendFile(publicPath + '/events/create_event.html');
});

app.post('/events', async (req, res) => {
  let form = req.body;
  let result = await BSDClient.fetchConstituent(form.cons_email);

  if (result.api.cons){
  	console.log('constituent found')
  	var constituent_id = result.api.cons.id;
  }
  else {
  	console.log('creating constituent...')
  	result = await BSDClient.createConstituent(form.cons_email);
  	var constituent_id = result.api.cons.id;
  }

  try{
  	let status = await BSDClient.createEvents(constituent_id, form);
  	res.send(status);
  }
  catch(e){
  	console.log(e);
  	res.json('could not create event');
  }
});

app.use(express.static(publicPath))
app.use(fallback('index.html', { root: publicPath }))
app.use('/graphql', graphQLHTTP({schema: Schema}));
app.listen(port, () => console.log(
  `Server is now running on http://localhost:${port}`
));