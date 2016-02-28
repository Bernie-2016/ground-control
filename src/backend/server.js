// NOTE: this needs to be the first thing loaded or New Relic won't work
import writeSchema from './data/writeSchema'
import newrelic from 'newrelic'
import express from 'express'
import graphQLHTTP from 'express-graphql'
import {Schema} from './data/schema'
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
import handlebars from 'handlebars'
import throng from 'throng'
import compression from 'compression'
import rp from 'request-promise'

const WORKERS = process.env.WEB_CONCURRENCY || 1

throng(startApp, {
  workers: WORKERS,
  lifetime: Infinity
})

function startApp() {
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
  const KnexSessionStore = KnexSessionStoreFactory(session)
  const Mailgun = new MG(process.env.MAILGUN_KEY, process.env.MAILGUN_DOMAIN)
  const BSDClient = new BSD(process.env.BSD_HOST, process.env.BSD_API_ID, process.env.BSD_API_SECRET)
  const port = process.env.PORT
  const publicPath = path.resolve(__dirname, '../frontend/public')
  const oneWeekInMillis = 604800000

  const templateDir = path.resolve(publicPath, 'admin/events');
  const createEventTemplate = fs.readFileSync(templateDir + '/create_event.hbs', {encoding: 'utf-8'});
  const createEventPage = handlebars.compile(createEventTemplate);
  const publicEventsRootUrl = process.env.PUBLIC_EVENTS_ROOT_URL

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
    if (req.user) {
      const userIsAdmin = await isAdmin(req.user.id)

      if (userIsAdmin)
        return next()
    }

    res.sendStatus(403)
  }

  let isAdmin = async (userId) => {
    const user = await knex('users').where('id', userId).first()
    if (req.user)
      return user.is_admin
    return false
  }

  let isStaff = async (userId) => {
    const user = await knex('users').where('id', userId).first()
    if (user && user.email){
      let domain = user.email.split('@')
      if (domain.length > 0)
        return (domain[1] === 'berniesanders.com' || user.is_admin)
    }
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
        } else {
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

  function eventDataLoader() {
      return new DataLoader(async (keys) => {
        let eventIds = keys.map((key) => {
          return key.toString().match(/^\d+$/) ? key : null
        }).filter((key) => key !== null)
        let obfuscatedIds = keys.filter((key) => {
          return eventIds.indexOf(key) === -1
        })

        let rows = await knex('bsd_events')
          .whereIn('event_id', eventIds)
          .orWhereIn('event_id_obfuscated', obfuscatedIds)
        return keys.map((key) => {
          return rows.find((row) =>
            row['event_id'].toString() === key.toString() || row['event_id_obfuscated'] === key.toString()
          )
        })
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
      bsdEvents: eventDataLoader(),
      bsdAddresses: dataLoaderCreator('bsd_addresses', 'cons_addr_id'),
      gcBsdGroups: dataLoaderCreator('gc_bsd_groups', 'id')
    }
  }

  const app = express()
  app.use(compression())
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

  app.use(express.static(publicPath, {
    maxAge: '180 days'
  }))
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

  app.get('/events/create', wrap(async (req, res) => {
    let userIsAuthed = false
    let userIsAdmin = false
    let userEmail = null
    if (req.user && req.user.id) {
      userIsAdmin = await isStaff(req.user.id)
      userIsAuthed = true
      userEmail = await knex('users')
        .select('email')
        .where('id', req.user.id)
        .first()
    }
    if (inDevEnv) {
      const temp = fs.readFileSync(templateDir + '/create_event.hbs', { encoding: 'utf-8' });
      const page = handlebars.compile(temp);
      res.send(page({
        is_public: !userIsAdmin,
        is_logged_in: userIsAuthed,
        events_root_url: publicEventsRootUrl,
        gcUser: req.user
      }));
      return
    }
    res.send(createEventPage({ is_public: !userIsAdmin, is_logged_in: userIsAuthed, events_root_url: publicEventsRootUrl, gcUser: req.user }));
  }))

  app.get('/admin/events/create', isAuthenticated, wrap(async (req, res) => {
    res.redirect('/events/create')
  }))

  app.get('/events/data/upload', wrap(async (req, res) => {
    res.redirect('https://script.google.com/macros/s/AKfycbwVZHnRZ5CJkzFID91QYcsLNFLkPgstd7XjS9o1QSEAh3tC2vY/exec')
  }))

  app.get('/events/add-rsvp', wrap(async(req, res) => {
    let response = null
    try {
      response = await BSDClient.addRSVPToEvent(req.query)
    } catch(ex) {
      res.status(400).send(ex.toString())
      return;
    }
    res.send(response.body)
  }))

  app.post('/events/create', wrap(async (req, res) => {

    let form = req.body
    let user = req.user ? req.user.email : 'Anonymous'
    log.info(`Event Create Form Submission to ${src} by ${user}`, JSON.stringify(form));

    const eventIdMap = {
      'volunteer-meeting': { id: 24, staffOnly: false },
      'ballot-access': { id: 30, staffOnly: false },
      'phonebank': { id: 31, staffOnly: false },
      'canvass': { id: 32, staffOnly: false },
      'barnstorm': { id: 41, staffOnly: false },
      'carpool-to-nevada': { id: 39, staffOnly: false },
      'carpool': { id: 39, staffOnly: false },
      'official-barnstorm': { id: 41, staffOnly: true },
      'get-out-the-vote': { id: 45, staffOnly: false },
      'vol2vol': { id: 47, staffOnly: true },
      'rally': { id: 14, staffOnly: true },
    }

    if (form['event_type_id'] === 'canvass'){
      const result = await rp('https://sheetsu.com/apis/bd810a50')
      const organizerArray = JSON.parse(result).result
      const organizers = organizerArray.filter((organizer) => (organizer.State === form['venue_state_cd']))
      if (organizers.length <= 0)
        res.status(400).send({errors: {
          'Event Type' : [`Canvasses are not yet supported in ${form['venue_state_cd']}. Please feel free to sign up host another event type!`]
        }})
    }

    // Flag event as needing approval
    let batchEventMax = 20
    let userIsStaff = false
    let flagForApproval = eventIdMap[form['event_type_id']].staffOnly

    if (req.user){
      userIsStaff = await isStaff(req.user.id)
      if (userIsStaff){
        flagForApproval = false
        batchEventMax = 40
      }
    }
    if (flagForApproval || eventIdMap[form['event_type_id']] === undefined){
      // form['flag_approval'] = '1'
      res.status(400).send({errors: {
        'Permission Error' : [`You don't have permission to use that event type.`]
      }})
      return
    }

    let src = 'unknown source'
    if (req.headers && req.headers.referer) {
      src = req.headers.referer.split(req.headers.origin)
      if (src)
        src = src[1]
    }
    if (!src) {
      // Sometimes the above results in undefined.
      // The sourceurl header is set from the client, so we don't necessarily want to trust it.
      src = req.headers.sourceurl;
      log.debug('Missing header data', req.headers);
    }
    if (!src)
      src = 'unknown source'

    // Require phone number for RSVPs to phonebanks
    if (form['event_type_id'] === 'phonebank' || form['event_type_id'] === 'carpool-to-nevada') {
      form['attendee_require_phone'] = 1;
    }

    form['event_dates'] = JSON.parse(form[ 'event_dates' ])
    let dateCount = form['event_dates'].length

    if (dateCount > batchEventMax) {
      res.status(400).send({errors: {
        'Number of Events' : [`You can only create up to ${batchEventMax} events at a time. ${form['event_dates'].length} events were received.`]
      }})
      return
    }

    form['event_type_id'] = isNaN(form['event_type_id']) ? String(eventIdMap[form['event_type_id']].id) : String(form['event_type_id'])
    if (process.env.NODE_ENV === 'development')
      form['event_type_id'] = '1'

    let eventType = await knex('bsd_event_types')
      .where('event_type_id', form['event_type_id'])
      .first()

    if (!eventType) {
      res.status(400).send({errors: {
        'Event Type': ['Does not exist in BSD']}
      })
      return
    }

    // constituent object not being returned right now
    let constituent = await BSDClient.getConstituentByEmail(form.cons_email)

    if (!constituent) {
      const name = form.cons_name.split(" ")
      constituent = await BSDClient.createConstituent(form.cons_email, name[ 0 ], (name.length > 1) ? name[ name.length - 1 ] : '')
    }

    form['creator_cons_id'] = constituent.id

    // Use time/duration or shifts
    let startHour = null
    if (form['use_shifts']){
      // try {
        startHour = (form['start_time']['a'][0] == 'pm') ? Number(form['start_time']['h'][0]) + 12 : form['start_time']['h'][0];
        form['days'] = [];
        form['days'].push({})
        form['days'][0]['shifts'] = form['start_time']['h'].map((item, index) => {
          return ({
              start_time: `${(form['start_time']['a'][index] == 'pm') ? Number(form['start_time']['h'][index]) + 12 : form['start_time']['h'][index]}:${form['start_time']['i'][index]}:00`,
              end_time: `${(form['end_time']['a'][index] == 'pm') ? Number(form['end_time']['h'][index]) + 12 : form['end_time']['h'][index]}:${form['end_time']['i'][index]}:00`,
              capacity: form['capacity']
            })
        })

      // }
      // catch(ex) {
      //   res.status(400).send({'errors': ex})
      // }
    }
    else
      startHour = (form['start_time']['a'] == 'pm') ? Number(form['start_time']['h']) + 12 : form['start_time']['h']

    let createdEventIds = []

    for (let index = 0; index < dateCount; index++) {
      let result = null
      if (form.hasOwnProperty('days')){
        if (form['use_shifts'])
          form.days[0].start_datetime_system = `${form['event_dates'][index]['date']} ${startHour}:${form['start_time']['i'][0]}:00`
        else
          form.days[0].start_datetime_system = `${form['event_dates'][index]['date']} ${startHour}:${form['start_time']['i']}:00`
      }
      log.info(form)
      try {
        result = await BSDClient.createEvent({
          ...form,
          'duration' : form['duration_num'] * form['duration_unit'],
          'capacity' : form['capacity'],
          'start_datetime_system' : `${form['event_dates'][index]['date']} ${startHour}:${form['start_time']['i']}:00`
        })

        createdEventIds.push(result.event_id_obfuscated)
      } catch(ex) {
        log.error(`Event Creation Error: ${ex.message} [${user}]`)

        let error = null

        try {
          error = JSON.parse(ex.message)
        } catch (jsonEx) {
          throw ex
        }

        res.status(400).send({'errors': error})
        return
      }
    }

    Mailgun.sendEventConfirmation(
      {
        ...form,
        event_type_name: eventType.name
      },
      createdEventIds,
      constituent
    )

    log.info(`Event Creation Success: ${createdEventIds.join(' ')} [${user}]`)

    res.send({ids: createdEventIds})
  }))

  app.use(fallback('index.html', {
    root: publicPath,
    maxAge: 0
  }))

  log.info('Starting up...')
  app.listen(port, () => log.info(
    `Server is now running on http://localhost:${port}`
  ))
}
