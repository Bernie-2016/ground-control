var thinky = require('thinky')();
var thinkyType = thinky.type;

export var Person = thinky.createModel("person", {
    id: thinkyType.string(),
    email: thinkyType.string()
});

export var Field = thinky.createModel("field", {
    id: thinkyType.string(),
    label: thinkyType.string(),
    type: thinkyType.string().enum(['NUMBER', 'STRING', 'BOOLEAN']), // TODO: Change this to use the same enum from the graphql schema
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

export var GroupCall = thinky.createModel("group_call", {
    id: thinkyType.string(),
    invitees: [{
        personId: thinkyType.string(),
        signedUp: thinkyType.boolean(),
        attended: thinkyType.boolean()
    }]
})