
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
  GroupCallInvitation,
  GroupCall
} from './models';

import Orchestra from '../orchestra';
import Promise from 'bluebird';

var {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    if (type === 'GroupCallInvitation')
      return GroupCallInvitation.get(id)
    else if (type === 'GroupCall')
      return GroupCall.get(id);
    else
      return null;
  },
  (obj) => {
    if (obj instanceof GroupCallInvitation)
      return GraphQLGroupCallInvitation;
    else if (obj instanceof GroupCall)
      return GraphQLGroupCall;
    else
      return null;
  }
);

function getViewer() {
  return {id: '1'}
}

 var GraphQLGroupCall = new GraphQLObjectType({
  name: "GroupCall",
  description: 'A group call',
  fields: () => ({
    id: globalIdField('GroupCall'),
    scheduledTime: { type: GraphQLString },
    maxSignups: { type: GraphQLInt }
  })
});

var {
  connectionType: GraphLQGroupCallConnection,
} = connectionDefinitions({
  name: 'GroupCall',
  nodeType: GraphQLGroupCall
});

var GraphQLGroupCallInvitation = new GraphQLObjectType({
  name: 'GroupCallInvitation',
  description: 'An invitation to a number of group calls.',
  fields: () => ({
    id: globalIdField('GroupCallInvitation'),
    topic: {
      type: GraphQLString
    },
    groupCallList: {
      type: GraphLQGroupCallConnection,
      args: connectionArgs,
      resolve: async (invitation, args) => {
        var groupCalls = await GroupCall.filter({groupCallInvitationId : invitation.id})
        return connectionFromArray(groupCalls, args);
      }
    }
  }),
  interfaces: [nodeInterface]
})

var {
  connectionType: GraphQLGroupCallInvitationConnection,
} = connectionDefinitions({
  name: 'GroupCallInvitation',
  nodeType: GraphQLGroupCallInvitation
});

var GraphQLViewer = new GraphQLObjectType({
  name: 'Viewer',
  fields: () => ({
    id: globalIdField('Viewer'),
    groupCallInvitationList: {
      type: GraphQLGroupCallInvitationConnection,
      args: connectionArgs,
      resolve: async (viewer, args) => {
        var invitations = await GroupCallInvitation.filter({})
        return connectionFromArray(invitations, args);
      }
    }
  }),
  interfaces: [nodeInterface]
})

var GraphQLGroupCallInput = new GraphQLInputObjectType({
  name: 'GroupCallInput',
  fields: {
    scheduledTime: { type: new GraphQLNonNull(GraphQLString) },
    maxSignups: { type: new GraphQLNonNull(GraphQLString) },
  }
})

var GraphQLCreateGroupCallInvitationMutation = mutationWithClientMutationId({
  name: 'CreateGroupCallInvitation',
  inputFields: {
    topic: { type: new GraphQLNonNull(GraphQLString) },
    groupCallList: { type: new GraphQLNonNull(new GraphQLList(GraphQLGroupCallInput)) }
  },
  outputFields: {
    viewer: {
      type: GraphQLViewer,
      resolve: () => {
        return getViewer();
      }
    }
  },
  mutateAndGetPayload: async ({topic, groupCallList}) => {
    var invitation = await GroupCallInvitation.save({topic: topic})
    var promises = [];
    var orchestra = new Orchestra('PWC0PU44ZPOHAI9L', '60aedf735b2b6f7cf83f34c8b560ac9b', 'http://myaccount.maestroconference.com/_access');
    groupCallList.forEach((groupCall) => {
      promises.push(GroupCall.save({
        scheduledTime: groupCall.scheduledTime,
        maxSignups: groupCall.maxSignups,
        signups: [],
        groupCallInvitationId: invitation.id
      }));
      promises.push(orchestra.createConferenceCall({name: topic, maxReservations: groupCall.maxSignups, startDate: "2015.10.21 05:30:00", duration: 60}))
    });

    await Promise.all(promises);
    return {};
  }
});

var RootMutation = new GraphQLObjectType({
  name: 'RootMutation',
  fields: () => ({
    createGroupCallInvitation: GraphQLCreateGroupCallInvitationMutation
  })
});

var RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => ({
    viewer: {
      type: GraphQLViewer,
      resolve: () => {
        return getViewer();
      }
    },
    node: nodeField
  }),
});

export var Schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation
});