import thinky from './thinky';
var thinkyType = thinky.type;

export var Person = thinky.createModel("person", {
  id: thinkyType.string().options({enforce_missing: false}),
  email: thinkyType.string()
});

export var Field = thinky.createModel("field", {
  id: thinkyType.string().options({enforce_missing: false}),
  label: thinkyType.string(),
  type: thinkyType.string().enum(['NUMBER', 'STRING', 'BOOLEAN']),
  choices: []
})

export var Note = thinky.createModel("note", {
  id: thinkyType.string().options({enforce_missing: false}),
  about: {
    table: thinkyType.string(),
    id: thinkyType.string()
  },
  fieldId: thinkyType.string(),
  value: thinkyType.any(),
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
  link: thinkyType.string()
})

export var SurveyQuestion = thinky.createModel("survey_question", {
  id: thinkyType.string().options({enforce_missing: false}),
  label: thinkyType.string(),
  fieldId: thinkyType.string()
})

export var GroupCall = thinky.createModel("group_call", {
  id: thinkyType.string().options({enforce_missing: false}),
  name: thinkyType.string(),
  scheduledTime: thinkyType.date(),
  maxSignups: thinkyType.number(),
  signups: [{
    personId: thinkyType.string(),
    attended: thinkyType.boolean(),
    role: thinkyType.string().enum(['HOST', 'NOTETAKER', 'PARTICIPANT'])
  }]
})