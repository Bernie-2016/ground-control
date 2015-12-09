import models from './models';
import faker from 'faker';
import csv from 'csv-load-sync';
import log from '../log';

if (process.env.NODE_ENV !== 'development') {
  log.error('Can only run this is development!')
  process.exit(1)
}

const NUM_PERSONS=15000;
const NUM_EVENTS=10000;

// Use this instead of faker because we want it to be just digits
let randomPhoneNumber = () => {
  return faker.phone.phoneNumber().replace(/\D/g,'').slice(0, 10);
}
// Generate a null value 1/3 of the time
let nully = (value) => {
  return faker.random.arrayElement([null, value, value])
}

// Capitalize first letter of every word
let toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

let randomOffsetFromCoord = (coord) => {
  let offset = Math.random() * 2 * (5 / 69) - 5/69
  return coord + offset
}

// Convert date objects to strings
let formatDate = (date) => {
  let minutes = addLeadingZero(date.getMinutes());
  let hours = addLeadingZero(date.getHours());
  let strTime = hours + ':' + minutes + ':00';
  return date.getFullYear() + '-' + addLeadingZero(date.getMonth()+1) + '-' + addLeadingZero(date.getDate()) + ' ' + strTime
}

let addLeadingZero = (val) => {
  val = val < 10 ? '0'+val : val;
  return val
}

models.sequelize.sync({force: true}).then(async () => {
  let zips = csv('./src/backend/data/zip-codes.csv')
  zips.forEach((datum) => {
    datum.timezoneOffset = parseInt(datum.timezoneOffset, 10)
    datum.latitude = parseFloat(datum.latitude)
    datum.longitude = parseFloat(datum.longitude)
    datum.hasDST = datum.hasDST == '1' ? true : false
  })
  let persons = [];
  let emails = [];
  let phones = [];
  let personGroups = {};
  let events = [];
  let addresses = [];
  let groups = [
    {
      id: 1,
      name: 'Volunteers',
      description: 'Volunteers'
    },
    {
      id: 2,
      name: 'Event hosts',
      description: 'Event hosts'
    },
    {
      id: 3,
      name: 'Elite callers',
      description: 'The top 1% of the top 0.1% of the top 1% of the top 0.1%'
    }
  ]
  await models.BSDGroup.bulkCreate(groups);
  let groupIDs = await models.BSDGroup.findAll({
    attributes: ['id']
  })
  groupIDs = groupIDs.map((queryObj) => queryObj.id)
  for (let index = 1; index <= NUM_PERSONS; index++) {
    persons.push({
      id: index,
      prefix: nully(faker.name.prefix()),
      firstName: nully(faker.name.firstName()),
      lastName: nully(faker.name.lastName()),
      middleName: nully(faker.name.firstName()),
      suffix: nully(faker.name.suffix()),
      gender: faker.random.arrayElement(['M', 'F', null]),
      birthDate: nully(faker.date.past()),
      title: nully(faker.name.jobTitle()),
      employer: nully(faker.company.companyName()),
      occupation: nully(faker.name.jobType()),
    })
    emails.push({
      id: index,
      cons_id: index,
      isPrimary: faker.random.boolean(),
      email: faker.internet.email().toLowerCase(),
    })
    phones.push({
      id: index,
      cons_id: index,
      isPrimary: true,
      phone: randomPhoneNumber(),
      textOptOut: faker.random.boolean()
    });

    let zip = faker.random.arrayElement(zips);
    addresses.push({
      id: index,
      cons_id: index,
      isPrimary: true,
      line1: faker.address.streetAddress(),
      line2: faker.address.secondaryAddress(),
      city: zip.city,
      state: zip.state,
      zip: zip.zip,
      country: 'US',
      latitude: randomOffsetFromCoord(zip.latitude),
      longitude: randomOffsetFromCoord(zip.longitude)
    })

    // Randomly add each person to a group.
    let numGroups = Math.floor(Math.random() * groupIDs.length);

    let groups = {}
    for (let i = 0; i < numGroups; i++) {
      groups[faker.random.arrayElement(groupIDs)] = true;
    }

    Object.keys(groups).forEach((key) => {
      let hash = index.toString() + ':' + key
      personGroups[hash] = true
    })
  }

  let eventTypes = [
    {
      id: 1,
      name: 'Test event 1',
    },
    {
      id: 2,
      name: 'Test event 2'
    }
  ]

  await models.BSDEventType.bulkCreate(eventTypes);

  let eventAttendees = []

  for (let index = 1; index <= NUM_EVENTS; index++) {
    let rsvp_use_reminder_boolean = faker.random.boolean();
    let rsvp_use_reminder_email = rsvp_use_reminder_boolean;
    let rsvp_reminder_hours = rsvp_use_reminder_boolean ? null : faker.random.number({min:0, max:30});
    let capacity = faker.random.arrayElement([0, faker.random.number({min:0, max:100})]);

    let zip = faker.random.arrayElement(zips);
    events.push({
      id: index,
      eventIdObfuscated: faker.internet.password(5),
      flagApproval: true,
      event_type_id: faker.random.arrayElement([1,2]),
      creator_cons_id: faker.random.number({min: 1, max: NUM_PERSONS}),
      name: toTitleCase(faker.lorem.sentence(3,5)),
      description: faker.lorem.paragraph(),
      venueName: toTitleCase(faker.lorem.sentence(1,4)),
      venueZip: zip.zip,
      venueCity: zip.city,
      venueState: zip.state,
      latitude: randomOffsetFromCoord(zip.latitude),
      longitude: randomOffsetFromCoord(zip.longitude),
      venueAddr1: faker.address.streetAddress(),
      venueAddr2: nully(faker.address.secondaryAddress()),
      venueCountry: faker.address.countryCode(),
      venueDirections: nully(faker.lorem.paragraph()),
      startDate: formatDate(faker.date.future()),
      duration: faker.random.number({min:1, max:1600}),
      capacity: capacity,
      localTimezone: faker.random.arrayElement(['US/Eastern', 'US/Pacific', 'Africa/Cairo']),
      attendeeVolunteerShow: faker.random.arrayElement([0, 1]),
      attendeeVolunteerMessage: faker.lorem.sentence(),
      isSearchable: -2,
      publicPhone: faker.random.boolean(),
      contactPhone: randomPhoneNumber(),
      hostReceiveRsvpEmails: 1,
      rsvpUseReminderEmail: rsvp_use_reminder_email,
      rsvpReminderHours: rsvp_reminder_hours
    })

    let numAttendees = faker.random.number({min:0, max:capacity})
    for (let attendeeIndex = 0; attendeeIndex < numAttendees; attendeeIndex++) {
      eventAttendees.push({
        id: faker.random.number({min: 0, max: 100000}),
        event_id: index,
        attendee_cons_id: faker.random.number({min: 1, max: NUM_PERSONS})
      })
    }
  };

  log.info('Creating...')

  await models.User.create({
    email: 'admin@localhost.com',
    password: 'admin',
    isAdmin: true
  });

  await models.BSDPerson.bulkCreate(persons);
  let personGroupsArr = []
  Object.keys(personGroups).forEach((hash) => {
    let ids = hash.split(':')
    personGroupsArr.push({
      cons_id: ids[0],
      cons_group_id: ids[1]
    })
  })

  let promises = [
    models.BSDEventAttendee.bulkCreate(eventAttendees),
    models.ZipCode.bulkCreate(zips),
    models.BSDEvent.bulkCreate(events),
    models.BSDAddress.bulkCreate(addresses),
    models.BSDPersonBSDGroup.bulkCreate(personGroupsArr),
    models.BSDEmail.bulkCreate(emails),
    models.BSDPhone.bulkCreate(phones)
  ]
  await Promise.all(promises);

  log.info('Done!');
})