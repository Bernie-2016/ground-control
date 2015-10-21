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

// An invitation gets sent to volunteers and they can pick one group call.
export var GroupCallInvitation = thinky.createModel("group_call_invitation", {
  id: thinkyType.string().options({enforce_missing: false}),
  topic: thinkyType.string(),
})

export var GroupCall = thinky.createModel("group_call", {
  id: thinkyType.string().options({enforce_missing: false}),
  scheduledTime: thinkyType.string(),
  maxSignups: thinkyType.string(),
  groupCallInvitationId: thinkyType.string(),
  signups: [{
    personId: thinkyType.string(),
    attended: thinkyType.boolean()
  }]
})

Note.belongsTo(Field, "field", "fieldId", "id")
GroupCallInvitation.hasMany(GroupCall, "groupCalls", "id", "groupCallInvitationId")
GroupCall.belongsTo(GroupCallInvitation, "groupCallInvitation", "groupCallInvitationId", "id")