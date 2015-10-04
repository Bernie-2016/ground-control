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
        scheduledTime: { type: GraphQLString },
        maxSignups: { type: GraphQLInt },
        invitees: { type: new GraphQLList(inviteeType) }
    })
})

var groupCallInvitationType = new GraphQLObjectType({
    name: 'GroupCallInvitation',
    description: 'An invitation to a number of group calls.',
    fields: () => ({
        id: globalIdField('GroupCallInvitation'),
        topic: { type: GraphQLString },
        groupCalls: { type: new GraphQLList(groupCallType) }
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


var groupCallInputType = new GraphQLInputObjectType({
    name: 'GroupCallInput',
    fields: {
        scheduledTime: { type: GraphQLString },
        maxSignups: { type: GraphQLInt }
    }
})

var CreateGroupCallInvitation = mutationWithClientMutationId({
    name: 'CreateGroupCallInvitation',
    inputFields: {
        topic: { type: GraphQLString },
//        groupCalls: { type: new GraphQLList(groupCallInputType) }
    },
    outputFields: {
        groupCallInvitation: { type: groupCallInvitationType }
    },
    mutateAndGetPayload: ({topic}) => {
        var newGroupCallInvitation = new GroupCallInvitation({
            topic: topic
        });
/*        groupCalls.forEach((call) => {
            var newGroupCall = new GroupCall({
                scheduledTime: call.scheduledTime,
                maxSignups: call.maxSignups,
                groupCallInvitation: newGroupCallInvitation,
//                signups: []
            })
            newGroupCall.saveAll()

        });
        */
        return newGroupCallInvitation
    },
});

var mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
        createGroupCallInvitation: CreateGroupCallInvitation
    })
});

export var Schema = new GraphQLSchema({
    query: queryType,
    // Uncomment the following after adding some mutation fields:
    mutation: mutationType
});