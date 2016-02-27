import knex from '../src/backend/data/knex'
import bsdClient from '../src/backend/bsd-instance'
import fs from 'fs'
import Baby from 'babyparse';

// Make this work to import a new cons group
function modelFromBSDResponse(BSDObject, type) {
  let modelKeys = {
    'bsd_surveys': ['signup_form_id', 'signup_form_slug', 'modified_dt', 'create_dt'],
    'bsd_groups': ['cons_group_id', 'name', 'description', 'modified_dt', 'create_dt'],
    'bsd_survey_fields': ['signup_form_field_id', 'modified_dt', 'create_dt', 'signup_form_id', 'format', 'label', 'display_order', 'is_shown', 'is_required', 'description']
  }
  let keys = modelKeys[type]
  let model = {}
  keys.forEach((key) => model[key] = BSDObject[key])
  return model;
}

async function main() {
  let filePath = process.argv[4]
  let groupId = process.argv[3]
  let rawData = fs.readFileSync(filePath, 'utf8').trim()
  let parsedData = Baby.parse(rawData, {header: true}).data
  let data = []
  let now = new Date()
  parsedData.forEach((datum) => {
    data.push({
      cons_group_id: groupId,
      cons_id: datum['Unique Constituent ID']
    })
  })
  await knex.transaction(async (trx) => {
    // This is copy pasta from schema.js
    let underlyingGroup = await knex('bsd_groups')
      .transacting(trx)
      .where('cons_group_id', groupId)
      .first()

    if (!underlyingGroup) {
      try {
        let BSDGroupResponse = await bsdClient.getConstituentGroup(groupId)
        let model = modelFromBSDResponse(BSDGroupResponse, 'bsd_groups')
        underlyingGroup = await knex.insertAndFetch('bsd_groups', model, {transaction: trx, idField: 'cons_group_id'})
      } catch (err) {
        if (err && err.response && err.response.statusCode === 409)
          throw new GraphQLError({
            status: 400,
            message: 'Provided group ID does not exist in BSD.'
          })
        else
          throw err
      }
    }
    await knex('bsd_person_bsd_groups')
      .where('cons_group_id', groupId)
      .delete()
      .transacting(trx)
    await knex.bulkInsert('bsd_person_bsd_groups', data, {transaction: trx})
  })
}

main()
  .then(() => { console.log('Done!') })
  .catch((ex) => { console.log(ex) })