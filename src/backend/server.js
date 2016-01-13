import express from 'express'
import graphQLHTTP from 'express-graphql'
import {Schema} from './data/schema'
import writeSchema from './data/writeSchema'
import path from 'path'
import fallback from 'express-history-api-fallback'
import bodyParser from 'body-parser'
import session from 'express-session'
import BSD from './bsd'
import MG from './mail'
import demoData from './data/demo.json'
import log from './log'
import {fromGlobalId} from 'graphql-relay'
import passport from 'passport'
import LocalStrategy  from 'passport-local'
import url from 'url'
import Minilog from 'minilog'
import rollbar from 'rollbar'
import {compare, hash} from './bcrypt-promise'
import knex from './data/knex'
import KnexSessionStoreFactory from 'connect-session-knex'
import DataLoader from 'dataloader'
import fs from 'fs'
import Handlebars from 'handlebars'

log.info('Writing schema...')
writeSchema()

const wrap = (fn) => {
  return (...args) =>
  {
    return fn(...args)
      .catch((ex) => {
        log.error(ex)
        process.nextTick(() => { throw ex })
      })
  }
}

const inDevEnv = (process.env.NODE_ENV === 'development')
const clientLogger = Minilog('client')
const KnexSessionStore = KnexSessionStoreFactory(session)
const Mailgun = new MG(process.env.MAILGUN_KEY, process.env.MAILGUN_DOMAIN)
const BSDClient = new BSD(process.env.BSD_HOST, process.env.BSD_API_ID, process.env.BSD_API_SECRET)
const port = process.env.PORT
const publicPath = path.resolve(__dirname, '../frontend/public')
const oneWeekInMillis = 604800000


var handlebars = require("handlebars");
const templateDir = path.resolve(publicPath, 'admin/events');
const createEventTemplate = fs.readFileSync(templateDir + '/create_event.hbs', {encoding: 'utf-8'});
const createEventPage = handlebars.compile(createEventTemplate);


const sessionStore = new KnexSessionStore({
  knex: knex,
  tablename: 'sessions'
})

function isAuthenticated(req, res, next) {
  if (req.user)
    return next()

  res.redirect('/signup?next=' + req.url)
}

let requireAdmin = async (req, res, next) => {
  if (req.user){
    const userIsAdmin = await isAdmin(req.user.id)
    if (userIsAdmin)
      return next()
  }

  res.sendStatus(403)
}

let isAdmin = async (userId) => {
  const user = await knex('users').where('id', userId).first();
  if (user.is_admin)
    return true
  return false
}

passport.use('signup', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  wrap(async (req, email, password, done) => {
    let user = await knex('users')
      .where('email', email.toLowerCase())
      .first()

    if (!user || user.password === null) {
      let hashedPassword = await hash(password)

      if (!user) {
        let newUser = await knex.insertAndFetch('users', {
            email: email.toLowerCase(),
            password: hashedPassword
          })
        return done(null, newUser)
      }
      else {
        await knex('users')
          .where('email', email.toLowerCase())
          .update({password: hashedPassword})
        return done(null, user)
      }
    } else if (!await compare(password, user.password)) {
      return done(null, false, { message: 'Incorrect password.' })
    }

    return done(null, user)
  })
))

passport.serializeUser(wrap(async (user, done) => {
  done(null, user.id)
}))

passport.deserializeUser(wrap(async (id, done) => {
  let user = await knex('users').where('id', id).first()
  done(null, user)
}))

const app = express()

app.use(rollbar.errorHandler(process.env.ROLLBAR_ACCESS_TOKEN))

rollbar.handleUncaughtExceptions(
  process.env.ROLLBAR_ACCESS_TOKEN,
  { exitOnUncaughtException: true }
)

// don't rate limit heroku
app.enable('trust proxy')

// redirect to CloudFlare SSL in prod if needed
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['cf-visitor'] === '{"scheme":"http"}') {
      return res.redirect(['https://', req.get('Host'), req.url].join(''))
    }

    next()
  })
}

function dataLoaderCreator(tablename, idField) {
  return new DataLoader(async (keys) => {
    // This way it works with strings passed in as well
    let rows = await knex(tablename).whereIn(idField, keys)

    return keys.map((key) => {
      return rows.find((row) => row[idField].toString() === key.toString())
    })
  })
}

class QueryLoader {
  batchQueries(queries) {
    let promises = queries.map((query) => {
      knex.raw(query)
    })

    return Promise.all(promises)
  }

  constructor() {
    this.dataLoader = new DataLoader(this.batchQueries)
  }

  load(query) {
    return this.dataLoader.load(query.toString())
  }

  loadMany(queries) {
    return this.dataLoader.loadMany(queries.map((query) => query.toString()))
  }
}

let createLoaders = () => {
  return {
    queries: new QueryLoader(),
    users: dataLoaderCreator('users', 'id'),
    bsdPeople: dataLoaderCreator('bsd_people', 'cons_id'),
    bsdPhones: dataLoaderCreator('bsd_phones', 'cons_phone_id'),
    bsdEmails: dataLoaderCreator('bsd_emails', 'cons_email_id'),
    bsdCallAssignments: dataLoaderCreator('bsd_call_assignments', 'id'),
    gcBsdSurveys: dataLoaderCreator('gc_bsd_surveys', 'id'),
    bsdSurveys: dataLoaderCreator('bsd_surveys', 'signup_form_id'),
    bsdEventTypes: dataLoaderCreator('bsd_event_types', 'event_type_id'),
    bsdEvents: dataLoaderCreator('bsd_events', 'event_id'),
    bsdAddresses: dataLoaderCreator('bsd_addresses', 'cons_addr_id'),
    gcBsdGroups: dataLoaderCreator('gc_bsd_groups', 'id')
  }
}

app.use(express.static(publicPath))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
  cookie: {
    maxAge: oneWeekInMillis
  },
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET,
  store: sessionStore
}))
app.use(passport.initialize())
app.use(passport.session())
app.use('/graphql', graphQLHTTP((request) => {
  return {
    rootValue: {
      user: request.user,
      loaders: createLoaders()
    },
    schema: Schema
  }
}))

app.post('/log', wrap(async (req, res) => {
  let parsedURL = url.parse(req.url, true)
  let logs = req.body.logs

  logs.forEach( (message) => {
    let method = message[1]
    let client = parsedURL.query.client_id ? parsedURL.query.client_id : ''

    message = message.slice(2)
    let writeLog = (line) => {
      let logLine = '(' + client + '): ' + line
      clientLogger[method](logLine)
    }

    message.forEach((logEntry) => {
      if (typeof logEntry === 'object') {
        writeLog(JSON.stringify(logEntry))
      } else {
        logEntry.split('\n').forEach( (line) => {
          writeLog(line)
        })
      }
    })
  })

  res.send('')
}))

app.post('/signup',
  passport.authenticate('signup'),
  wrap(async (req, res) => {
    res.send('Successfully signed in')
  })
)

app.post('/logout',
  wrap(async (req, res) => {
    req.logout()
    res.send('Successfully logged out')
  })
)

app.get('/admin/events/create', isAuthenticated, wrap(async (req, res) => {
  if (inDevEnv){
    const temp = fs.readFileSync(templateDir + '/create_event.hbs', {encoding: 'utf-8'});
    const page = handlebars.compile(temp);
    res.send(page({is_public: false}));
    return
  }
  res.send(createEventPage({is_public: false}));
}))

app.get('/events/create', wrap(async (req, res) => {
  if (inDevEnv){
    const temp = fs.readFileSync(templateDir + '/create_event.hbs', {encoding: 'utf-8'});
    const page = handlebars.compile(temp);
    res.send(page({is_public: true}));
    return
  }
  res.send(createEventPage({is_public: true}));
}))

app.post('/events/create', wrap(async (req, res) => {
  const src = req.headers.referer.split(req.headers.origin)[1];
  let form = req.body
  form['event_dates'] = JSON.parse(form['event_dates']);

  // Flag event as needing approval
  let batchEventMax = 20;
  if (req.user && src === '/admin/events/create') {
    // const userIsAdmin = await isAdmin(req.user.id)
    if ((form['event_type_id'] != 31 && form['event_type_id'] != 44) || form['is_official'] == 1) // to do: implement proper permissioning
      form['flag_approval'] = '1'
  }
  else {
    batchEventMax = 10;
    form['flag_approval'] = '1'
  }

  // constituent object not being returned right now
  let constituent = await BSDClient.getConstituentByEmail(form.cons_email)

  if (!constituent) {
    const name = form.cons_name.split(" ");
    constituent = await BSDClient.createConstituent(form.cons_email, name[0], (name.length > 1) ? name[name.length - 1] : '')
  }

  let event_types = await BSDClient.getEventTypes()
  let result = await BSDClient.createEvents(constituent.id, form, event_types, batchEventMax)
  log.info(result)
  
  if (result.status == 'success') {
    if (form['event_type_id'] == 31) {
      // Send phone bank specific email
      // Mailgun.sendPhoneBankConfirmation(form, result.ids, constituent)
      // re-enable phonebank email after we find a way to track when these have been sent
      Mailgun.sendEventConfirmation(form, result.ids, constituent, event_types)
    }
    else {
      // Send generic email
      Mailgun.sendEventConfirmation(form, result.ids, constituent, event_types)
    }
    clientLogger['info'](`Event Creation Success: ${result.ids} added by ${req.user.email}`);
	} else {
    clientLogger['error'](`Event Creation Error: ${result.errors}`);
  }

	res.json(result);
}))

app.use(fallback('index.html', {
  root: publicPath,
  maxAge: 0
}))

log.info('Starting up...')
app.listen(port, () => log.info(
  `Server is now running on http://localhost:${port}`
))
