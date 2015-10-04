import thinky from './thinky';
var thinkyType = thinky.type;

export var Person = thinky.createModel("person", {
    id: thinkyType.string(),
    email: thinkyType.string()
});

export var Field = thinky.createModel("field", {
    id: thinkyType.string(),
    label: thinkyType.string(),
    type: thinkyType.string().enum(['NUMBER', 'STRING', 'BOOLEAN']),
    choices: []
})

export var Note = thinky.createModel("note", {
    id: thinkyType.string(),
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

Note.belongsTo(Field, "field", "fieldId", "id")

// An invitation gets sent to volunteers and they can pick one group call.
export var GroupCallInvitation = thinky.createModel("group_call_invitation", {
    id: thinkyType.string(),
    topic: thinkyType.string(),
})

export var GroupCall = thinky.createModel("group_call", {
    id: thinkyType.string(),
    scheduledTime: thinkyType.date(),
    maxSignups: thinkyType.number(),
    groupCallInvitationId: thinkyType.string(),
    signups: [{
        personId: thinkyType.string(),
        attended: thinkyType.boolean()
    }]
})

GroupCall.belongsTo(GroupCallInvitation, "groupCallInvitation", "groupCallInvitationId", "id")