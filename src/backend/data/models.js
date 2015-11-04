import thinky from './thinky';
var thinkyType = thinky.type;

export var Person = thinky.createModel("person", {
  id: thinkyType.string().options({enforce_missing: false}),
});

export var Field = thinky.createModel("field", {
  id: thinkyType.string().options({enforce_missing: false}),
  label: thinkyType.string(),
  type: thinkyType.string().enum(['NUMBER', 'STRING', 'BOOLEAN', 'DATETIME']),
  choices: [],
  maxLength: thinkyType.number(),
  validationFunc: thinkyType.string()
})

export var Note = thinky.createModel("note", {
  id: thinkyType.string().options({enforce_missing: false}),
  personId: thinkyType.string(),
  fieldId: thinkyType.string(),
  value: thinkyType.any(),
  entryTime: thinkyType.date(),
  source: {
    table: thinkyType.string(),
    id: thinkyType.string()
  }
})

export var Survey = thinky.createModel("survey", {
  id: thinkyType.string().options({enforce_missing: false}),
  data: [{
    table: thinkyType.string(),
    id: thinkyType.string()
  }],
  slug: thinkyType.string()
})

export var GroupCall = thinky.createModel("group_call", {
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