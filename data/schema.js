import {
    GraphQLBoolean,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
} from 'graphql';

import {
    connectionArgs,
    connectionDefinitions,
    connectionFromArray,
    fromGlobalId,
    globalIdField,
    mutationWithClientMutationId,
    nodeDefinitions,
} from 'graphql-relay';

import {
    Person,
    Field,
    Note,
    GroupCall
} from './models';

var {nodeInterface, nodeField} = nodeDefinitions(
    (globalId) => {
        var {type, id} = fromGlobalId(globalId);
        if (type === 'Person')
            return Person.get(id);
        else if (type === 'GroupCall')
            return GroupCall.get(id);
        else
            return null;
    },
    (obj) => {
        if (obj instanceof Person)
            return personType;
        else if (obj instanceof GroupCall)
            return groupCallType;
        else
            return null;
    }
);

var inviteeType = new GraphQLObjectType({
    name: 'GroupCallInvitee',
    description: 'A single invitee to a group call',
    fields: () => ({
        person: {
            type: personType,
            resolve: (invitee) => { return Person.get(invitee.personId); }
        },
        signedUp: { type: GraphQLBoolean },
        attended: { type: GraphQLBoolean}
    })
})

var groupCallType = new GraphQLObjectType({
    name: 'GroupCall',
    description: 'A group call with a bunch of people',
    fields: () => ({
        id: globalIdField('GroupCall'),
        invitees: { type: new GraphQLList(inviteeType) }
    })
})

var personType = new GraphQLObjectType({
    name: 'Person',
    description: 'A person that has at some point signed up',
    fields: () => ({
        id: globalIdField('Person'),
        email: { type: GraphQLString },
    }),
    interfaces: [nodeInterface],
});

var {connectionType: personConnection} =
  connectionDefinitions({name: 'Person', nodeType: personType});

var queryType = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
        node: nodeField,
        groupCall: {
            type: groupCallType,
            args: {
                id: {
                    description: 'id',
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: (root, {id}) => {
                return GroupCall.get(id);
            }
        },
    }),
});


//var mutationType = new GraphQLObjectType({
//  name: 'Mutation',
//  fields: () => ({
        // Add your own mutations here
//  })
//});

export var Schema = new GraphQLSchema({
    query: queryType,
    // Uncomment the following after adding some mutation fields:
    // mutation: mutationType
});
