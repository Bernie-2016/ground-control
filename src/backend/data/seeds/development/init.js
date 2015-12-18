import faker from 'faker';
import csv from 'csv-load-sync';
import log from '../../../log';
import {hash} from '../../../bcrypt-promise';
import json2csv from 'json2csv';
import Promise from 'bluebird'
import fs from 'fs';

const toCSV = Promise.promisify(json2csv);
const writeFile = Promise.promisify(fs.writeFile)
let unlink = Promise.promisify(fs.unlink)
const NUM_PERSONS=25342;
const NUM_EVENTS=15413;

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

// Remove punctuation in names and titles
let titlify = (str) => {
  return toTitleCase(str.replace(/[,.]+/g, ''))
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

exports.seed = async function(knex, Promise) {
  if (process.env.NODE_ENV !== 'development') {
    log.error('Can only run this is development!')
    process.exit(1)
  }

  let data = {
    'users': [],
    'bsd_people': [],
    'bsd_addresses' : [],
    'bsd_events' : [],
    'bsd_event_attendees': [],
    'bsd_person_bsd_groups' : [],
    'bsd_emails': [],
    'bsd_phones': [],
    'bsd_groups': [],
    'bsd_event_types' : [],
    'zip_codes' : []
  }

  let deletePromises = Object.keys(data).map((key) => {
    return knex(key).del()
  })

  await Promise.all(deletePromises);

  let timestamps = {
    create_dt: new Date(),
    modified_dt: new Date()
  }

  log.info('Creating admin user...')
  let password = await hash('admin')

  data.users = [{
    email: 'admin@localhost.com',
    password: password,
    is_admin: true,
    ...timestamps
  }]

  log.info('Generating zips...')
  data.zip_codes = csv('./seeds/zip-codes.csv')
  data.zip_codes.forEach((datum) => {
    datum.timezone_offset = parseInt(datum.timezone_offset, 10)
    datum.latitude = parseFloat(datum.latitude)
    datum.longitude = parseFloat(datum.longitude)
    datum.has_dst = datum.has_dst == '1' ? true : false
    datum.create_dt = timestamps.create_dt;
    datum.modified_dt = timestamps.modified_dt;
  })

  log.info('Generating groups...')
  data.bsd_groups = [
    {
      cons_group_id: 1,
      name: 'Volunteers',
      description: 'Volunteers',
      ...timestamps
    },
    {
      cons_group_id: 2,
      name: 'Event hosts',
      description: 'Event hosts',
      ...timestamps
    },
    {
      cons_group_id: 3,
      name: 'Elite callers',
      description: 'The top 1% of the top 0.1% of the top 1% of the top 0.1%',
      ...timestamps
    }
  ]

  let groupIDs = [1, 2, 3]


  log.info('Generating people...')
  for (let index = 1; index <= NUM_PERSONS; index++) {
    data.bsd_people.push({
      cons_id: index,
      prefix: nully(faker.name.prefix()),
      firstname: nully(faker.name.firstName()),
      lastname: nully(faker.name.lastName()),
      middlename: nully(faker.name.firstName()),
      suffix: nully(faker.name.suffix()),
      gender: faker.random.arrayElement(['M', 'F', null]),
      birth_dt: faker.date.past(),
      title: nully(faker.name.jobTitle()),
      employer: nully(faker.company.companyName()),
      occupation: nully(faker.name.jobType()),
      ...timestamps
    })
    data.bsd_emails.push({
      cons_email_id: index,
      cons_id: index,
      is_primary: faker.random.boolean(),
      email: faker.internet.email().toLowerCase(),
      ...timestamps
    })
    data.bsd_phones.push({
      cons_phone_id: index,
      cons_id: index,
      is_primary: true,
      phone: randomPhoneNumber(),
      isunsub: faker.random.boolean(),
      ...timestamps
    });

    let zip = faker.random.arrayElement(data.zip_codes);
    data.bsd_addresses.push({
      cons_addr_id: index,
      cons_id: index,
      is_primary: true,
      addr1: faker.address.streetAddress(),
      addr2: faker.address.secondaryAddress(),
      city: zip.city,
      state_cd: zip.state,
      zip: zip.zip,
      country: 'US',
      latitude: randomOffsetFromCoord(zip.latitude),
      longitude: randomOffsetFromCoord(zip.longitude),
      ...timestamps
    })

    // Randomly add each person to a group.
    let numGroups = Math.floor(Math.random() * groupIDs.length);

    let groups = {}
    for (let i = 0; i < numGroups; i++) {
      groups[faker.random.arrayElement(groupIDs)] = true;
    }

    Object.keys(groups).forEach((key) => {
      data.bsd_person_bsd_groups.push({
        cons_id: index,
        cons_group_id: key,
        ...timestamps
      })
    })
  }

  log.info('Generating event types...')
  data.bsd_event_types = [
    {
      event_type_id: 1,
      name: 'Test event 1',
      ...timestamps
    },
    {
      event_type_id: 2,
      name: 'Test event 2',
      ...timestamps
    },
    {
      event_type_id: 3,
      name: 'Phonebank',
      ...timestamps
    }
  ]
  let eventAttendeeCount = 0

  log.info('Generating events and attendees...')
  for (let index = 1; index <= NUM_EVENTS; index++) {
    let rsvp_use_reminder_boolean = faker.random.boolean();
    let rsvp_use_reminder_email = rsvp_use_reminder_boolean;
    let rsvp_email_reminder_hours = rsvp_use_reminder_boolean ? null : faker.random.number({min:0, max:30});
    let capacity = faker.random.arrayElement([0, faker.random.number({min:0, max:100})]);

    let zip = faker.random.arrayElement(data.zip_codes);
    data.bsd_events.push({
      event_id: index,
      event_id_obfuscated: faker.internet.password(5),
      flag_approval: true,
      event_type_id: faker.random.arrayElement(data.bsd_event_types.map((type) => type.event_type_id)),
      creator_cons_id: faker.random.number({min: 1, max: NUM_PERSONS}),
      name: titlify(faker.lorem.sentence(3,5)),
      description: faker.lorem.paragraph(),
      venue_name: titlify(faker.lorem.sentence(1,4)),
      venue_zip: zip.zip,
      venue_city: zip.city,
      venue_state_cd: zip.state,
      latitude: randomOffsetFromCoord(zip.latitude),
      longitude: randomOffsetFromCoord(zip.longitude),
      venue_addr1: faker.address.streetAddress(),
      venue_addr2: nully(faker.address.secondaryAddress()),
      venue_country: faker.address.countryCode(),
      venue_directions: nully(faker.lorem.paragraph()),
      start_dt: formatDate(faker.date.future()),
      duration: faker.random.number({min:1, max:1600}),
      capacity: capacity,
      start_tz: faker.random.arrayElement(['US/Central', 'US/Eastern', 'US/Pacific', 'US/Mountain']),
      attendee_volunteer_show: faker.random.arrayElement([0, 1]),
      attendee_volunteer_message: faker.lorem.sentence(),
      is_searchable: -2,
      public_phone: faker.random.boolean(),
      contact_phone: randomPhoneNumber(),
      host_receive_rsvp_emails: 1,
      rsvp_use_reminder_email: rsvp_use_reminder_email,
      rsvp_email_reminder_hours: rsvp_email_reminder_hours,
      ...timestamps
    })

    let numAttendees = faker.random.number({min:0, max:capacity})
    for (let attendeeIndex = 0; attendeeIndex < numAttendees; attendeeIndex++) {
      data.bsd_event_attendees.push({
        event_attendee_id: eventAttendeeCount,
        event_id: index,
        attendee_cons_id: faker.random.number({min: 1, max: NUM_PERSONS}),
        ...timestamps
      })
      eventAttendeeCount += 1;
    }
  }

  let insertOrder = ['users', 'zip_codes', 'bsd_groups', 'bsd_event_types', 'bsd_people', 'bsd_events', 'bsd_event_attendees', 'bsd_addresses', 'bsd_person_bsd_groups', 'bsd_emails', 'bsd_phones']

  for (let index = 0; index < insertOrder.length; index++) {
    let key = insertOrder[index]
    log.info(`Importing ${key}...`)
    if (data[key].length === 0)
      continue
    let columns = Object.keys(data[key][0]);
    let csvData = await toCSV({data: data[key]})
    let filename = `${key}.csv`
    let path = `${process.cwd()}/${filename}`;
    csvData = csvData.split('\n').slice(1).join('\n')
    csvData = csvData.replace(/\"null\"/g, "null")
    await writeFile(filename, csvData);
    await knex.raw(`COPY ${key} (${columns.join(',')}) FROM '${path}' WITH NULL AS 'null' CSV;`)
    await unlink(filename);
  }

  log.info('Done!')
};
