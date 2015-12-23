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
import rateLimit from 'express-rate-limit'
import {compare, hash} from './bcrypt-promise'
import knex from './data/knex'
import KnexSessionStoreFactory from 'connect-session-knex'
import DataLoader from 'dataloader'

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

const clientLogger = Minilog('client')
const KnexSessionStore = KnexSessionStoreFactory(session)
const Mailgun = new MG(process.env.MAILGUN_KEY, process.env.MAILGUN_DOMAIN)
const BSDClient = new BSD(process.env.BSD_HOST, process.env.BSD_API_ID, process.env.BSD_API_SECRET)
const port = process.env.PORT
const publicPath = path.resolve(__dirname, '../frontend/public')
const limiter = rateLimit({windowMs: 10000, max: 50})

const sessionStore = new KnexSessionStore({
  knex: knex,
  tablename: 'sessions',
})

function isAuthenticated(req, res, next) {
  if (req.user)
    return next()

  res.redirect('/signup');
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

    if (!user) {
      let hashedPassword = await hash(password)
      let newUser = await knex.insertAndFetch('users', {
          email: email.toLowerCase(),
          password: hashedPassword
        })
      return done(null, newUser)
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

app.enable('trust proxy') // don't rate limit heroku

// List the routes that need to be rate limited
let rateLimitRoutes = [
  "/graphql",
  "/log",
  "/signup",
  "/events"
]

// Rate limit the routes
//rateLimitRoutes.forEach((route) => {
//  app.use(route,limiter)
//})

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
    return Promise.all(promises);
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
    gcBsdGroups: dataLoaderCreator('gc_bsd_groups', 'id'),
  }
}

app.use(express.static(publicPath))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: sessionStore
}))
app.use(passport.initialize())
app.use(passport.session())
app.use('/graphql', graphQLHTTP((request) => {
  return {
    rootValue: {
      user: request.user,
      loaders: createLoaders(),
    },
    schema: Schema
  }
}))

app.post('/log', wrap(async (req, res) => {
  let parsedURL = url.parse(req.url, true)
  let logs = req.body.logs
  logs.forEach((message) => {
    let app = message[0]
    let method = message[1]
    let client = parsedURL.query.client_id ? parsedURL.query.client_id : ''

    message = message.slice(2)
    let writeLog = (line) => {
      let logLine = '(' + client + '): ' + line
      clientLogger[method](logLine)
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

app.post('/signup',
  passport.authenticate('signup'),
  wrap(async (req, res) => {
    res.send('Successfully signed in');
  })
)

app.post('/logout',
  wrap(async (req, res) => {
    req.logout()
    res.send('Successfully logged out')
  })
)

app.get('/admin/events/create', isAuthenticated, wrap(async (req, res) => {
  res.sendFile(publicPath + '/admin/events/create_event.html')
}))

app.get('/events/create', wrap(async (req, res) => {
  res.sendFile(publicPath + '/admin/events/create_event_public.html')
}))

app.post('/events/create', wrap(async (req, res) => {
  let form = req.body

  // Flag event as needing approval if user is not authenticated
  if (!req.user){
    form['flag_approval'] = 1
  }

  // constituent object not being returned right now
  let constituent = await BSDClient.getConstituentByEmail(form.cons_email)

  if (!constituent){
    constituent = await BSDClient.createConstituent(form.cons_email)
  }

  let event_types = await BSDClient.getEventTypes()

  let result = await BSDClient.createEvents(constituent.id, form, event_types, eventCreationCallback)

  // send event creation confirmation email
  function eventCreationCallback(status){
  	res.json(status)
  	if (status == 'success'){
      if (form['event_type_id'] == 31){
        // Send phone bank specific email
        Mailgun.sendPhoneBankConfirmation(form, constituent)
      }
  		else {
        // Send generic email
        Mailgun.sendEventConfirmation(form, constituent, event_types)
      }
  	}
    else {
      clientLogger['error']('Event Creation Error:', status)
    }
  }
}))

app.use(fallback('index.html', { root: publicPath }))

log.info('Starting up...')
app.listen(port, () => log.info(
  `Server is now running on http://localhost:${port}`
))

