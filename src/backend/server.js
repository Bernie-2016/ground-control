import express from 'express';
import graphQLHTTP from 'express-graphql';
import {Schema} from './data/schema';
import writeSchema from './data/writeSchema';
import path from 'path';
import fallback from 'express-history-api-fallback';
import bodyParser from 'body-parser';
import session from 'express-session';
import BSD from './bsd';
import MG from './mail';
import demoData from './data/demo.json';
import models from './data/models'
import log from './log';
import {fromGlobalId} from 'graphql-relay'
import passport from 'passport';
import LocalStrategy  from 'passport-local'
import SequelizeStoreFactory from 'connect-session-sequelize'
import url from 'url';
import Minilog from 'minilog';
import uuid from 'node-uuid';

writeSchema();

const wrap = (fn) => {
  return (...args) =>
  {
    return fn(...args)
      .catch((ex) => {
        log.error(ex)
        process.nextTick(() => { throw ex; });
      })
  }
}

const clientLogger = Minilog('client')
const SequelizeStore = SequelizeStoreFactory(session.Store)
const Mailgun = new MG(process.env.MAILGUN_KEY, process.env.MAILGUN_DOMAIN);
const BSDClient = new BSD(process.env.BSD_HOST, process.env.BSD_API_ID, process.env.BSD_API_SECRET);
const port = process.env.PORT;
const publicPath = path.resolve(__dirname, '../frontend/public');

function isAuthenticated(req, res, next) {
  if (req.user)
    return next();

  res.redirect('/signup');
}

passport.use('signup', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  wrap(async (req, email, password, done) => {
    let user = await models.User.findOne({
      where: {
        email: email.toLowerCase()
      }
    });

    if (!user) {
      let newUser = await models.User.create({
        email: email.toLowerCase(),
        password: password,
      });
      return done(null, newUser);
    }
    else if (!await user.verifyPassword(password)) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  }
)));

passport.serializeUser(wrap(async (user, done) => {
  done(null, user.id);
}));

passport.deserializeUser(wrap(async (id, done) => {
  let user = await models.User.findById(id);
  done(null, user);
}));

const app = express();
const sessionStore = new SequelizeStore({
  db: models.sequelize,
  table: 'Session'
})

app.use(express.static(publicPath))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/graphql', graphQLHTTP((request) => {
  return {
    rootValue: { user: request.user },
    schema: Schema
  }
}));

app.post('/log', wrap(async (req, res) => {
  let parsedURL = url.parse(req.url, true);
  let logs = req.body.logs;
  logs.forEach((message) => {
    let app = message[0];
    let method = message[1];
    let client = parsedURL.query.client_id ? parsedURL.query.client_id : ''

    message = message.slice(2);
    let writeLog = (line) => {
      let logLine = '(' + client + '): ' + line;
      clientLogger[method](logLine);
    }

    message.forEach((logEntry) => {
      if (typeof logEntry === 'object')
        writeLog(JSON.stringify(logEntry))
      else {
        logEntry.split('\n').forEach((line) => {
          writeLog(line)
        })
      }
    })
  })

  res.send('')
}))

app.post('/password_reset', wrap(async (req, res) => {
  // All errors in this endpoint will result in a 200 response.
  // This prevents people from mining emails through brute
  // force.
  if(!req.body.email) {
    return res.status(200).end();
  }

  let user = await models.User.findOne({ where: {email:req.body.email} });

  if(!user) {
    return res.status(200).end();
  }

  console.log(req.body.email)
  console.log(JSON.stringify(user))

  // Generate a globally unique reset token for the user
  // We create it as a property of the user since we only
  // issue one at a time, and require that the token
  // match the email address when updating.
  await user.set('resetToken',uuid.v4());
  await user.save();

  let email = await Mailgun.sendPasswordReset(user);

  res.status(200).end();
}))

app.post('/password_reset/:token', wrap(async (req, res) => {
  let token = req.params.token;
  let email = req.body.email;
  let password = req.body.password;

  if(!token || !email || !password) {
    // Malformed request
    return res.status(422).end();
  }

  let user = await models.User.update({ password: password, resetToken: null },{ where : { email: email, resetToken: token}, individualHooks: true});

  if(user[0]===0) {
    // Either the email or token were incorrect
    return res.status(400).end();
  }

  res.status(200).end();
}))

app.post('/signup',
  passport.authenticate('signup'),
  wrap(async (req, res) => {
  res.send('Success!')
}))

app.post('/logout',
  wrap(async (req, res) => {
  req.logout();
  res.send('Success!')
}))

app.get('/events/create', isAuthenticated, wrap(async (req, res) => {
  res.sendFile(publicPath + '/events/create_event.html');
}));

app.post('/events/create', isAuthenticated, wrap(async (req, res) => {
  let form = req.body;

  // constituent object not being returned right now
  let constituent = await BSDClient.getConstituentByEmail(form.cons_email);

  if (!constituent){
    constituent = await BSDClient.createConstituent(form.cons_email);
  }

  let event_types = await BSDClient.getEventTypes();

  let result = await BSDClient.createEvents(constituent.id, form, event_types, eventCreationCallback);

  // send event creation confirmation email
  function eventCreationCallback(status){
  	res.json(status);
  	if (status == 'success'){
      if (form['event_type_id'] == 31){
        // Send phone bank specific email
        Mailgun.sendPhoneBankConfirmation(form, constituent);
      }
  		else {
        // Send generic email
        Mailgun.sendEventConfirmation(form, constituent, event_types);
      }
  	}
    else {
      clientLogger['error']('Event Creation Error:', status);
    }
  }
}));

app.use(fallback('index.html', { root: publicPath }))

app.listen(port, () => log.info(
`Server is now running on http://localhost:${port}`
))



