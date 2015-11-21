import thinky from './thinky';
import validator from 'validator';

let type = thinky.type;

export const Account = thinky.createModel('account', {
  id: type.string().options({enforce_missing: false}),
  personId: type.string(),
  password: type.boolean(),
  role: type.string().enum(['ADMIN', 'VOLUNTEER'])
})

export const Address = thinky.createModel('address', {
  id: type.string().options({enforce_missing: false}),
  personId: type.string(),
  line1: type.string().allowNull(true),
  line2: type.string().allowNull(true),
  city: type.string().allowNull(true),
  state: type.string().allowNull(true),
  country: type.string().allowNull(true),
  zip: type.string().regex(/[0-9]+/),
  location: type.point()
})

export const Phone = thinky.createModel('phone', {
  id: type.string().options({enforce_missing: false}),
  personId: type.string(),
  number: type.string().regex(/[0-9]+/).length(10)
})

export const Email = thinky.createModel('email', {
  id: type.string().options({enforce_missing: false}),
  personId: type.string(),
  address: type.string().email().lowercase()
})

export const Person = thinky.createModel('person', {
  id: type.string().options({enforce_missing: false}),
  BSDId: type.string().allowNull(true),
  firstName: type.string().allowNull(true),
  middleName: type.string().allowNull(true),
  lastName: type.string().allowNull(true),
});

Person.defineStatic('createFromBSDConstituent', async (BSDModel) => {
  let existingPerson = await Person.filter({BSDId: BSDModel.id})
  existingPerson = existingPerson[0];
  let personInfo = {
    BSDId: BSDModel.id,
    firstName: BSDModel.firstname,
    middleName: BSDModel.middlename,
    lastName: BSDModel.lastname
  }
  console.log(existingPerson.id)
  if (existingPerson) {
    // I AM HERE TRYING TO MAKE THIS WORK
//    await Promise.all([
//      Email.filter({personId: existingPerson.id}).delete(),
//        Phone.filter({personId: existingPerson.id}).delete(),
//        Address.filter({personId: existingPerson.id}).delete
//    ])
    personInfo['id'] = existingPerson.id
  }

  let person = await Person.save(personInfo, {conflict: 'update'})

  let emails = BSDModel.cons_email.map((emailObj) => {
    return {
      personId: person.id,
      address: emailObj.email

    }
    emailObj.email
  })

  let phones = BSDModel.cons_phone.map((phoneObj) => {
    return {
      personId: person.id,
      number: phoneObj.phone
    }
  })

  let addresses = BSDModel.cons_addr.map((addressObj) => {
    return {
      personId: person.id,
      line1: addressObj.addr1,
      line2: addressObj.addr2,
      city: addressObj.city,
      state: addressObj.state_cd,
      country: addressObj.country,
      zip: addressObj.zip,
      location: {
        latitude: parseFloat(addressObj.latitude),
        longitude: parseFloat(addressObj.longitude)
      }
    }
  })
  await Promise.all([Email.save(emails), Phone.save(phones), Address.save(addresses)])
  return person
})

export const Group = thinky.createModel('group', {
  id: type.string().options({enforce_missing: false}),
  BSDId: type.string().allowNull(true),
  personIdList: [type.string()],
})

export const CallAssignment = thinky.createModel('call_assignment', {
  id: type.string().options({enforce_missing: false}),
  name: type.string(),
  callerGroupId: type.string(),
  targetGroupId : type.string(),
  surveyId: type.string(),
//  startDate: type.date(),
//  endDate: type.date().allowNull(true)
})

export const Call = thinky.createModel('call', {
  id: type.string().options({enforce_missing: false}),
  callAssignmentId: type.string(),
  callerId: type.string(),
  intervieweeId: type.string(),
  callAssignedAt: type.date()
})

export const Survey = thinky.createModel('survey', {
  id: type.string().options({enforce_missing: false}),
  BSDId: type.string().allowNull(true)
})

export const GroupCall = thinky.createModel('group_call', {
  id: type.string().options({enforce_missing: false}),
  name: type.string(),
  scheduledTime: type.date(),
  maxSignups: type.number(),
  duration: type.number(),
  maestroConferenceUID: type.string(),
  signups: [{
    personId: type.string(),
    attended: type.boolean(),
    role: type.string().enum(['host', 'note_taker', 'participant'])
  }]
})

export const Field = thinky.createModel('field', {
  id: type.string().options({enforce_missing: false}),
  label: type.string(),
  type: type.string().enum(['Number', 'String', 'Boolean', 'Date', 'Point']),
  validators: {
    function: type.string().enum([
      'enum', 'min', 'max', 'regex', 'lowercase', 'uppercase', 'integer'
    ]),
    args: []
  }
})

export const Note = thinky.createModel('note', {
  id: type.string().options({enforce_missing: false}),
  personId: type.string(),
  fieldId: type.string(),
  value: type.any(),
  entryTime: type.date(),
  source: {
    type: type.string().enum(['survey', 'group_call', 'BSD']),
    id: type.string()
  }
}, {
  validator: (data) => {
    return true;
  }
})