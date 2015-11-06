import thinky from './thinky';
var thinkyType = thinky.type;

const BsdLink = {
  type: thinkType.string(),
  id: thinkType.string()
}

const DataSource = {
  table: thinkType.string(),
  id: thinkyType.string()
}

export const Person = thinky.createModel("person", {
  id: thinkyType.string().options({enforce_missing: false}),
  bsdLink: BsdLink
});

export const Group = thinky.createModel("person_group" {
  id: thinkyType.string().options({enforce_missing: false}),
  personIdList: [thinkyType.string()],
  bsdLink: BsdLink
})

export const CallAssignment = think.createModel("call_assignment", {
  id: thinkyType.string().options({enforce_missing: false}),
  name: thinkyType.string(),
  callerGroupId: thinkyType.string(),
  targetGroupId : thinkyType.string(),
  surveyId: thinkyType.string(),
})

export const Call = think.createModel("call", {
  id: thinkyType.string().options({enforce_missing: false}),
  callAssignmentId: thinkyType.string(),
  callerId: thinkyType.string(),
  intervieweeId: thinkyType.string(),
  callAssignedAt: thinkyType.date()
})

export const Survey = thinky.createModel("survey", {
  id: thinkyType.string().options({enforce_missing: false}),
  slug: thinkyType.string(),
  bsdLink: BsdLink
})

export const GroupCall = thinky.createModel("group_call", {
  id: thinkyType.string().options({enforce_missing: false}),
  name: thinkyType.string(),
  scheduledTime: thinkyType.date(),
  maxSignups: thinkyType.number(),
  duration: thinkyType.number(),
  maestroConferenceUID: thinkyType.string(),
  signups: [{
    personId: thinkyType.string(),
    attended: thinkyType.boolean(),
    role: thinkyType.string().enum(['HOST', 'NOTETAKER', 'PARTICIPANT'])
  }]
})

// Unused models for now
export const Field = thinky.createModel("field", {
  id: thinkyType.string().options({enforce_missing: false}),
  label: thinkyType.string(),
  type: thinkyType.string().enum(['NUMBER', 'STRING', 'BOOLEAN', 'DATETIME']),
  choices: [],
  maxLength: thinkyType.number(),
  validationFunc: thinkyType.string(),
  bsdLink: BsdLink
})

export const Note = thinky.createModel("note", {
  id: thinkyType.string().options({enforce_missing: false}),
  personId: thinkyType.string(),
  fieldId: thinkyType.string(),
  value: thinkyType.any(),
  entryTime: thinkyType.date(),
  source: DataSource
})