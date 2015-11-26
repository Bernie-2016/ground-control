import models from './models';
import faker from 'faker';

const NUM_PERSONS=500;
// Generate a null value 1/3 of the time
let nully = (value) => {
  return randomChoice([null, value, value])
}

let randomChoice = (arr) => {
  let index = Math.floor(Math.random() * arr.length)
  return arr[index];
}

models.sequelize.sync({force: true}).then(() => {
  let persons = []
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
      occupation: nully(faker.name.jobType())
    })
  }
  console.log('Creating...')
  models.Person.bulkCreate(persons);
  console.log('Done!');
})