import bsdClient from '../src/backend/bsd-instance'
import fs from 'fs'
import Baby from 'babyparse';
import colors from 'colors';
import moment from 'moment-timezone';

async function main() {
  let rawData = fs.readFileSync('./scripts/exported_events.tsv', 'utf8')
  let events = Baby.parse(rawData, {header: true, delimiter: '\t'}).data

  let eventCount = events.length;

  let count = 0;
  for (let index=0; index < eventCount; index++) {
    let event = events[index];
    count += 1
    delete event['outreach_page_id']
    Object.keys(event).forEach((key) => {
      if (event[key] === 'NULL')
        event[key] = null
    })
    event['attendee_require_phone'] = true
    if (event.event_id !== '') {
      console.log(`${count}. Updating ${event.event_id_obfuscated}: ${event.name}...`.green)
      let response = await bsdClient.updateEvent(event)
      console.log('Done')
    }
  }
}

main()
  .then(() => { console.log('Done!') })
  .catch((ex) => { console.log(ex) })