import models from './models';
import faker from 'faker';
import csv from 'csv-load-sync';
import log from '../log';

if (process.env.NODE_ENV !== 'development') {
  log.error('Can only run this is development!')
  process.exit(1)
}

const NUM_PERSONS=10;
const NUM_EVENTS=20;

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
  let persons = [];
  let emails = [];
  let phones = [];
  let personGroups = [];
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
    })
    addresses.push({
      id: index,
      cons_id: index,
      isPrimary: true,
      line1: faker.address.streetAddress(),
      line2: faker.address.secondaryAddress(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
      country: 'US',
      latitude: faker.address.latitude(),
      longitude: faker.address.longitude()
    })

    // Randomly add each person to a group.
    let numGroups = Math.floor(Math.random() * groupIDs.length);

    let groups = {}
    for (let i = 0; i < numGroups; i++) {
      groups[faker.random.arrayElement(groupIDs)] = true;
    }

    Object.keys(groups).forEach((key) => {
      personGroups.push({
        cons_id: index,
        cons_group_id: key
      })
    })
  }

  for (let index = 1; index <= NUM_EVENTS; index++) {
    let rsvp_use_reminder_boolean = faker.random.boolean();
    let rsvp_use_reminder_email = rsvp_use_reminder_boolean;
    let rsvp_reminder_hours = rsvp_use_reminder_boolean ? null : faker.random.number({min:0, max:30});
    events.push({
      id: index,
      eventIdObfuscated: faker.internet.password(5),
      flagApproval: true,
      eventTypeId: faker.random.arrayElement([1,2]),
      creator_cons_id: faker.random.number({min: 1, max: NUM_PERSONS}),
      name: toTitleCase(faker.lorem.sentence(3,5)),
      description: faker.lorem.paragraph(),
      venueName: toTitleCase(faker.lorem.sentence(1,4)),
      venueZip: faker.address.zipCode(),
      venueCity: faker.address.city(),
      venueState: faker.address.stateAbbr(),
      venueAddr1: faker.address.streetAddress(),
      venueAddr2: nully(faker.address.secondaryAddress()),
      venueCountry: faker.address.countryCode(),
      venueDirections: nully(faker.lorem.paragraph()),
      startDate: formatDate(faker.date.future()),
      duration: faker.random.number({min:1, max:1600}),
      capacity: faker.random.arrayElement([0, faker.random.number({min:0, max:500})]),
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
  };

  let zips = csv('./src/backend/data/zip-codes.csv')
  zips.forEach((datum) => {
    datum.timezoneOffset = parseInt(datum.timezoneOffset, 10)
    datum.latitude = parseFloat(datum.latitude)
    datum.longitude = parseFloat(datum.longitude)
    datum.hasDST = datum.hasDST == '1' ? true : false
  })

  log.info('Creating...')
  await models.User.create({
    email: 'admin@localhost.com',
    password: 'admin',
    isAdmin: true
  })
  await models.BSDPerson.bulkCreate(persons);
  let promises = [
    models.ZipCode.bulkCreate(zips),
    models.BSDEvent.bulkCreate(events),
    models.BSDAddress.bulkCreate(addresses),
    models.BSDPersonGroup.bulkCreate(personGroups),
    models.BSDEmail.bulkCreate(emails),
    models.BSDPhone.bulkCreate(phones)
  ]
  await Promise.all(promises);
  log.info('Done!');
})