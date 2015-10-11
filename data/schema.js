
import {
    GraphQLBoolean,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLInputObjectType,
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
    GroupCall,
    GroupCallInvitation
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
)

var inviteeType = new GraphQLObjectType({
    name: 'GroupCallInvitee',
    description: 'A single invitee to a group call',
    fields: () => ({
        person: {
            type: new GraphQLNonNull(personType),
            resolve: (invitee) => { return Person.get(invitee.personId); }
        },
        signedUp: { type: new GraphQLNonNull(GraphQLBoolean) },
        attended: { type: new GraphQLNonNull(GraphQLBoolean) }
    })
})

var groupCallType = new GraphQLObjectType({
    name: 'GroupCall',
    description: 'A group call with a bunch of people',
    fields: () => ({
        id: globalIdField('GroupCall'),
        scheduledTime: { type: new GraphQLNonNull(GraphQLString) },
        maxSignups: { type: new GraphQLNonNull(GraphQLInt) },
        invitees: { type: new GraphQLNonNull(new GraphQLList(inviteeType)) }
    })
})

var groupCallInvitationType = new GraphQLObjectType({
    name: 'GroupCallInvitation',
    description: 'An invitation to a number of group calls.',
    fields: () => ({
        id: globalIdField('GroupCallInvitation'),
        topic: { type: new GraphQLNonNull(GraphQLString) },
        groupCalls: {
            type: new GraphQLNonNull(new GraphQLList(groupCallType)),
            resolve: (groupCallInvitation) => {
                return groupCallInvitation.groupCalls || []
            }
        }
    })
})

var personType = new GraphQLObjectType({
    name: 'Person',
    description: 'A person that has at some point signed up',
    fields: () => ({
        id: globalIdField('Person'),
        email: { type: new GraphQLNonNull(GraphQLString) },
    }),
    interfaces: [nodeInterface],
});


var groupCallInputType = new GraphQLInputObjectType({
    name: 'GroupCallInput',
    fields: {
        scheduledTime: { type: new GraphQLNonNull(GraphQLString) },
        maxSignups: { type: new GraphQLNonNull(GraphQLInt) }
    }
})

var CreateGroupCallInvitation = mutationWithClientMutationId({
    name: 'CreateGroupCallInvitation',
    inputFields: {
        topic: { type: new GraphQLNonNull(GraphQLString) },
        groupCalls: { type: new GraphQLList(groupCallInputType) }
    },
    outputFields: {
        groupCallInvitation: {
            type: groupCallInvitationType,
            resolve: (payload) => payload
        }
    },
    mutateAndGetPayload: async ({topic, groupCalls}) => {
        var newGroupCallInvitation = new GroupCallInvitation({
            topic: topic
        });
        newGroupCallInvitation.groupCalls = []

        groupCalls.map(call => {
            var newGroupCall = new GroupCall({
                scheduledTime: call.scheduledTime,
                maxSignups: call.maxSignups,
                signups: []
            })
            newGroupCall.groupCallInvitation = newGroupCallInvitation;
            newGroupCallInvitation.groupCalls.push(newGroupCall);
        })

        return newGroupCallInvitation.saveAll()
    },
});

var mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
        createGroupCallInvitation: CreateGroupCallInvitation
    })
});

var queryType = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
        node: nodeField,
        groupCallInvitation: {
            type: groupCallInvitationType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: (root, {id}) => {
                return GroupCallInvitation.get(id);
            }
        },
        groupCall: {
            type: groupCallType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: (root, {id}) => {
                return GroupCall.get(id);
            }
        }
    }),
});

export var Schema = new GraphQLSchema({
    query: queryType,
    // Uncomment the following after adding some mutation fields:
    mutation: mutationType
});