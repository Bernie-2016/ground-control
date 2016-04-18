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
import proxy from 'express-http-proxy'
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
import Slack from './slack'
import SlackError from './slack'
import moment from 'moment'

const WORKERS = process.env.WEB_CONCURRENCY || 1

throng(startApp, {
  workers: WORKERS,
  lifetime: Infinity
})

const shiftSchemaMap = {
  'canvass-3-shifts': [
    {
      id: 1,
      start: '9:00 am',
      end: '12:00 pm'
    },
    {
      id: 2,
      start: '12:00 pm',
      end: '3:00 pm'
    },
    {
      id: 3,
      start: '3:00 pm',
      end: '6:00 pm'
    }
  ],
  'canvass-4-shifts': [
    {
      id: 1,
      start: '9:00 am',
      end: '12:00 pm'
    },
    {
      id: 2,
      start: '12:00 pm',
      end: '3:00 pm'
    },
    {
      id: 3,
      start: '3:00 pm',
      end: '6:00 pm'
    },
    {
      id: 4,
      start: '6:00 pm',
      end: '9:00 pm'
    }
  ],
  'get-out-the-vote': [
    {
      id: 1,
      start: '9:00 am',
      end: '12:00 pm'
    },
    {
      id: 2,
      start: '12:00 pm',
      end: '3:00 pm'
    },
    {
      id: 3,
      start: '3:00 pm',
      end: '6:00 pm'
    },
    {
      id: 4,
      start: '6:00 pm',
      end: '9:00 pm'
    }
  ],
  'primary-day': [
    {
      id: 1,
      start: '8:00 am',
      end: '12:00 pm'
    },
    {
      id: 2,
      start: '12:00 pm',
      end: '4:00 pm'
    },
    {
      id: 3,
      start: '4:00 pm',
      end: '8:00 pm'
    }
  ]
}

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

  const SlackClient = new Slack();

  async function createNewBSDUser(email, password) {
    //Create a new BSD User
    await BSDClient.createConstituent(email);

    //Set the new BSD User's password
    await BSDClient.setConstituentPassword(email, password);

    log.info(`BSD user ${email} created.`)
  }

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
    if (user)
      return user.is_admin
    return false
  }

  let isStaff = async (userId) => {
    if (!userId) {
      return false
    }
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
      let bsdUser = await BSDClient.getConstituentByEmail(email)
      log.debug(bsdUser)

      let user = await knex('users')
        .where('email', email.toLowerCase())
        .first()

      //Create password
      let hashedPassword = await hash(password)

      //Check bsdCredentials
      let bsdCredentialsResponse = await BSDClient.checkCredentials(email, password)
      let bsdCredentialsValid = (typeof bsdCredentialsResponse === 'object' && bsdCredentialsResponse.api.cons)

      //If user exists and credentials are valid but no BSD user, create new BSD constituent and log in
      if (user && (!bsdUser || bsdUser.has_account === '0')) {
        log.debug('no account!!!')
        if (user.password === null || user.password === undefined) {
          // Create new BSD User and log in
          log.info(`Ground control user ${email} has null password; setting new password and creating new BSD user...`)
          await createNewBSDUser(email, password)

          // Set user's new password
          await knex('users')
            .where('email', email.toLowerCase())
            .update({password: hashedPassword})

          return done(null, user)
        }
        else if (await compare(password, user.password)) {
          // Create new BSD User and log in
          log.info(`Ground control user ${email} exists; creating new BSD user...`)
          await createNewBSDUser(email, password)

          return done(null, user)
        }
        else {
          // Login is invalid
          return done(null, false, {
            message: 'Incorrect password.',
            "url": "https://www.bluestatedigital.com/ctl/Core/AdminResetPass"
          });
        }
      }
      //If BSD credentials are incorrect, give error message with a link to reset password via BSD
      else if (bsdUser && bsdUser.has_account === '1' && !bsdCredentialsValid) {
        return done(null, false, {
          message: 'Incorrect password.',
          "url": "https://www.bluestatedigital.com/ctl/Core/AdminResetPass"
        });
      }
      //If BSD constituent does not exist, create a new BSD constituent AND ground-control user with those credentials
      else if (!user && (!bsdUser || bsdUser.has_account === '0')) {
        log.info(`User ${email} does not exist; creating new BSD user...`)

        // Create new BSD User
        await createNewBSDUser(email, password)

        //Create a new GC User
        if (!user) {
          let newUser = await knex.insertAndFetch('users', {
            email: email.toLowerCase(),
            password: hashedPassword
          });
          //Finished, return the new GC user
          return done(null, newUser)
        }
        //Update existing GC User that has a null password
        else {
          await knex('users')
            .where('email', email.toLowerCase())
            .update({password: hashedPassword});

          return done(null, user)
        }
      }
      // If same credentials, create a new ground-control user with those credentials
      else if (bsdCredentialsValid) {
        if (!user) {
          let newUser = await knex.insertAndFetch('users', {
            email: email.toLowerCase(),
            password: hashedPassword
          });
        }

        // If account credentials are correct but the password for ground-control is incorrect, update the ground-control password and log in
        else {
          await knex('users')
            .where('email', email.toLowerCase())
            .update({password: hashedPassword});
        }

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
        let rows = await knex('bsd_events')
          .whereIn('event_id_obfuscated', keys)
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

  // Slack Organization Invites:
  app.post('/slack-invites',
    wrap(async (req, res) => {
      log.debug(req.body)
      const response = await SlackClient.createInvite(req.body.slackTeam, req.body.email)
      log.debug(response)
      return res.status(200)
    })
  )

  app.use('/volunteer-dashboard/', proxy('volunteer-dashboard.saikat.svc.tutum.io:8000', {
    forwardPath: function(req, res) {
      return url.parse(req.url).path
    }
  }))
  app.get('/volunteer-dashboard', async (req, res) => {
    res.redirect('/volunteer-dashboard/')
  })

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

  app.get('/events/data/upload', wrap(async (req, res) => {
    res.redirect('https://script.google.com/macros/s/AKfycbwVZHnRZ5CJkzFID91QYcsLNFLkPgstd7XjS9o1QSEAh3tC2vY/exec')
  }))

  app.get('/nda', wrap(async (req, res) => {
    res.redirect('https://docs.google.com/forms/d/1cyoAcumEd4Co5Fqj9pOUnQtIUo_rfRzQ7oVqACFe5Rs/viewform')
  }))

  app.post('/events/add-rsvp', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "*")
    res.header('Access-Control-Allow-Methods', "*")
    
  	const makeRequest = async (body) => {
  		log.debug(body)
  		let response = null
  		try {
  		  response = await BSDClient.addRSVPToEvent(body)
  		} catch(ex) {
  			body.error = JSON.parse(ex.message).error_description || ex.toString()
  		  res.status(400).json(body)
  		  log.error(ex)
  		  return
  		}
  		res.json(response.body)
  	}

    const getShiftsAndRSVP = (idType='event_id_obfuscated') => {
      const eventIds = req.body[idType].split(',')
      eventIds.forEach(async (eventId) => {
        if (!eventId)
          return
        else if (req.body.shift_ids === undefined){
          const shift = await knex('bsd_event_shifts')
            .join('bsd_events', 'bsd_event_shifts.event_id', 'bsd_events.event_id')
            .where(`bsd_events.${idType}`, eventId)
            .orderBy('bsd_event_shifts.start_dt', 'asc')
            .first()
          if (shift)
            req.body.shift_ids = shift.event_shift_id
        }
        else {
          req.body.guests = req.body.shift_ids.split(',').map(() => 0).join(',')
        }
        req.body[idType] = eventId
        makeRequest(req.body)
      })
    }

    if (req.body.event_id_obfuscated){
      getShiftsAndRSVP()
    }
    else if (req.body.event_id){
      getShiftsAndRSVP('event_id')
    }
    else
    	makeRequest(req.body)
  })

  app.get('/events/shift-schema.json', wrap(async (req, res) => {
    res.json(shiftSchemaMap)
  }))

  app.get('/events/:id/get-rsvps.json', requireAdmin, wrap(async (req, res) => {
    const attendees = await knex('bsd_event_attendees')
      .join('bsd_events', 'bsd_event_attendees.event_id', 'bsd_events.event_id')
      .leftJoin('bsd_people', 'bsd_event_attendees.attendee_cons_id', 'bsd_people.cons_id')
      .leftJoin('bsd_phones', 'bsd_event_attendees.attendee_cons_id', 'bsd_phones.cons_id')
      .leftJoin('bsd_emails', 'bsd_event_attendees.attendee_cons_id', 'bsd_emails.cons_id')
      .leftJoin('bsd_addresses', 'bsd_event_attendees.attendee_cons_id', 'bsd_addresses.cons_id')
      .where('bsd_events.event_id_obfuscated', req.params.id)
      .where('bsd_phones.is_primary', true)
      .where('bsd_emails.is_primary', true)
      .where('bsd_addresses.is_primary', true)
      .select('bsd_people.cons_id', 'bsd_people.firstname', 'bsd_people.lastname')
      .select('bsd_phones.phone')
      .select('bsd_emails.email')
      .select('bsd_addresses.addr1', 'bsd_addresses.addr2', 'bsd_addresses.city', 'bsd_addresses.state_cd', 'bsd_addresses.zip', 'bsd_addresses.zip_4', 'bsd_addresses.country')

    res.json(attendees)
  }))

  app.get('/admin/events/create', isAuthenticated, wrap(async (req, res) => {
    res.redirect('/events/create')
  }))

  app.get('/events/create', wrap(async (req, res) => {
    let userIsAdmin = false
    if (req.user && req.user.id) {
      userIsAdmin = await isStaff(req.user.id)
    }

    res.send(createEventPage({ is_public: !userIsAdmin, events_root_url: publicEventsRootUrl, gcUser: req.user }));
  }))

  app.post('/events/create', wrap(async (req, res) => {

    let form = req.body
    let user = req.user ? req.user.email : 'Anonymous'
    const eventTypeIdString = form['event_type_id']

    log.info(`Event Create Form Submission to ${src} by ${user}`, JSON.stringify(form))

    const eventIdMap = {
      'volunteer-meeting': { id: 24, staffOnly: false },
      'ballot-access': { id: 30, staffOnly: false },
      'phonebank': { id: 31, staffOnly: false, requirePhone: true },
      'canvass': { id: 32, staffOnly: false, requirePhone: true },
      'canvass-3-shifts': { id: 32, staffOnly: true, requirePhone: true },
      'canvass-4-shifts': { id: 32, staffOnly: true, requirePhone: true },
      'barnstorm': { id: 41, staffOnly: false },
      'carpool-to-nevada': { id: 39, staffOnly: false, requirePhone: true },
      'carpool': { id: 39, staffOnly: false, requirePhone: true },
      'debate-watch': { id: 36, staffOnly: false },
      'official-barnstorm': { id: 41, staffOnly: true },
      'organizing-meeting': { id: 34, staffOnly: true },
      'get-out-the-vote-training': { id: 34, staffOnly: true },
      'get-out-the-vote': { id: 45, staffOnly: true, requirePhone: true },
      'primary-day': { id: 45, staffOnly: true, requirePhone: true },
      'vol2vol': { id: 47, staffOnly: true },
      'rally': { id: 14, staffOnly: true },
      'voter-registration': { id: 22, staffOnly: false, requirePhone: true }
    }

    function getDayWithDefaultShifts(shiftSchemaMap, eventType, shiftIDs, capacity, day) {
      const convertTime = (time) => moment(time, 'hh:mm a').format('HH:mm:ss')
      function filterShiftsById() {
        // const shiftIdSet = new Set(shiftIDs)
        // return shiftSchemaMap[eventType].filter((shift) => shiftIdSet.has(shift.id))
        return shiftSchemaMap[eventType] // don't support choosing custom shifts for now
      }
      function convertToBSDShifts(shifts, capacity) {
        return shifts.map((shift) => {
          return {
            'start_time': convertTime(shift.start),
            'end_time': convertTime(shift.end),
            capacity
          }
        })
      }
      
      const shifts = filterShiftsById()
      const bsdShifts = convertToBSDShifts(shifts, capacity)

      return {
          start_datetime_system: `${day} ${bsdShifts[0].start_time}`,
          shifts: bsdShifts
        }
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
    if (eventIdMap[form['event_type_id']].requirePhone) {
      form['attendee_require_phone'] = 1;
    }

    let eventDates = JSON.parse(form[ 'event_dates' ])
    eventDates = eventDates.map((eventDate) => eventDate.date)
    const eventDatesSet = new Set(eventDates)
    eventDates = [...eventDatesSet]

    if (eventDates.length > batchEventMax) {
      res.status(400).send({errors: {
        'Number of Events' : [`You can only create up to ${batchEventMax} events at a time. ${eventDates.length} events were received.`]
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
    }
    else if (form['start_time'] !== undefined) {
      form['days'] = [];
      form['days'].push({});
      startHour = (form['start_time']['a'] == 'pm') ? Number(form['start_time']['h']) + 12 : form['start_time']['h']
    }

    let createdEventIds = []
    for (let index = 0; index < eventDates.length; index++) {
      let result = null

      // Enforce standard event shifts
      if (eventTypeIdString in shiftSchemaMap){
        const dayWithDefaultShifts = getDayWithDefaultShifts(shiftSchemaMap, eventTypeIdString, form.shift_ids, form.capacity, eventDates[index])        
        form['use_shifts'] = '1'
        form.days = []
        form.days.push(dayWithDefaultShifts)
      }
      else if (form.hasOwnProperty('days') && form['use_shifts']){
        form.days[0].start_datetime_system = `${eventDates[index]} ${startHour}:${form['start_time']['i'][0]}:00`
      }
      else {
        form.days[0].start_datetime_system = `${eventDates[index]} ${startHour}:${form['start_time']['i']}:00`;
        form.days[0].duration = form['duration_num'] * form['duration_unit'];
      }

      try {
        result = await BSDClient.createEvent(form)

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
