import thinky from './thinky';
import validator from 'validator';
let type = thinky.type;

export const Permissions = thinky.createModel('permissions', {
  id: type.string().options({enforce_missing: false}),
  personId: type.string(),
  permissionLevel: type.string().enum(['ADMIN'])
})

export const Person = thinky.createModel('person', {
  id: type.string().options({enforce_missing: false}),
  BSDId: type.string().allowNull(true),
  firstName: type.string().allowNull(true),
  lastName: type.string().allowNull(true),
  emails: type.array().schema({
    email: type.string().email().lowercase(),
    isPrimary: type.boolean()
  }).validator((field) => field.length > 0),
  phones: [type.string().regex(/[0-9]+/).length(10)],
  zipCode: type.string().regex(/[0-9]+/).allowNull(true)
});

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