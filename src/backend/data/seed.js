import models from './models';
import faker from 'faker';

const NUM_PERSONS=1000;
// Generate a null value 1/3 of the time
let nully = (value) => {
  return randomChoice([null, value, value])
}

let randomChoice = (arr) => {
  let index = Math.floor(Math.random() * arr.length)
  return arr[index];
}

models.sequelize.sync({force: true}).then(async () => {
  let persons = [];
  let emails = [];
  let phones = [];
  let personGroups = [];
  let groups = [
    {
      name: 'Volunteers',
      description: 'Volunteers'
    },
    {
      name: 'Event hosts',
      description: 'Event hosts'
    },
    {
      name: 'Elite callers',
      description: 'The top 1% of the top 0.1% of the top 1% of the top 0.1%'
    }
  ]
  await models.Group.bulkCreate(groups);
  let groupIDs = await models.Group.findAll({
    attributes: ['id']
  })
  groupIDs = groupIDs.map((queryObj) => queryObj.id)
  for (let index = 0; index < NUM_PERSONS; index++) {
    persons.push({
      id: index,
      prefix: nully(faker.name.prefix()),
      firstName: nully(faker.name.firstName()),
      lastName: nully(faker.name.lastName()),
      middleName: nully(faker.name.firstName()),
      suffix: nully(faker.name.suffix()),
      gender: randomChoice(['M', 'F', null]),
      birthDate: nully(faker.date.past()),
      title: nully(faker.name.jobTitle()),
      employer: nully(faker.company.companyName()),
      occupation: nully(faker.name.jobType()),
    })
    emails.push({
      id: index,
      cons_id: index,
      isPrimary: randomChoice([true, false]),
      address: faker.internet.email(),
    })
    phones.push({
      id: index,
      cons_id: index,
      isPrimary: randomChoice([true, false]),
      number: faker.phone.phoneNumber(),
      textOptOut: randomChoice([true, false])
    })

    // Randomly add each person to a group.
    let numGroups = Math.floor(Math.random() * groupIDs.length);

    let groups = {}
    for (let i = 0; i < numGroups; i++) {
      groups[randomChoice(groupIDs)] = true;
    }

    Object.keys(groups).forEach((key) => {
      personGroups.push({
        cons_id: index,
        group_id: key
      })
    })
  }
  console.log('Creating...')
  await models.Person.bulkCreate(persons);
  let promises = [
    models.PersonGroup.bulkCreate(personGroups),
    models.Email.bulkCreate(emails),
    models.Phone.bulkCreate(phones)
  ]
  await Promise.all(promises);
  console.log('Done!');
})