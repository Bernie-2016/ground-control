import knex from '../src/backend/data/knex'
import bsdClient from '../src/backend/bsd-instance'

var people
function formatPhone(phone) {
  if (phone.length === 11)
    return phone.slice(1)
  else
    return phone
}
knex('bsd_person_bsd_groups')
  .distinct('bsd_phones.cons_id')
  .select('bsd_phones.phone')
  .where('cons_group_id', 2897)
  .join('bsd_phones', 'bsd_phones.cons_id', 'bsd_person_bsd_groups.cons_id')
  .leftOuterJoin('bsd_addresses', 'bsd_addresses.cons_id', 'bsd_person_bsd_groups.cons_id')
  .whereNull('bsd_addresses.cons_id')
  .where('bsd_phones.is_primary', true)
  .then((results) => {
    people = results
    let phones = results.map((row) => {
      return formatPhone(row.phone)
    })

    return knex('bsd_phones')
      .innerJoin('bsd_addresses', 'bsd_addresses.cons_id', 'bsd_phones.cons_id')
      .innerJoin('bsd_emails', 'bsd_emails.cons_id', 'bsd_phones.cons_id')
      .whereIn('phone', phones)
  })
  .then((rows) => {
    let addresses = {}
    people.map((person) => {
      let addr = rows.find((row) => {
        return formatPhone(row.phone) === formatPhone(person.phone)
      })
      if (addr)
        addresses[person.cons_id] = addr
    })
    return Promise.all(Object.keys(addresses).map(async (key) => {
      let addr = addresses[key]
      await bsdClient.setConstituentData(key, 'cons_addr', {
        is_primary: true,
        addr1: addr.addr1,
        addr2: addr.addr2,
        addr3: addr.addr3,
        city: addr.city,
        state_cd: addr.state_cd,
        zip: addr.zip,
        zip_4: addr.zip_4,
        country: addr.country,
        latitude: addr.latitude,
        longitude: addr.longitude
      })
      await bsdClient.setConstituentData(key, 'cons_email', {email: addr.email})
      return
    }))
  })
  .then(() => {
    console.log('Done!')
  })
  .catch((ex) => {
    console.log(ex)
  })