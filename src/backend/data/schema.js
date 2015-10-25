
import {
  GraphQLBoolean,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLEnumType
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

import Maestro from '../maestro';
import Promise from 'bluebird';
import thinky from './thinky';

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

var GraphQLChronoFilter = new GraphQLEnumType({
  name: 'GroupCallInvitation',
  values: {
    UPCOMING: { value: "upcoming" },
    PAST: { value: "past" },
    ALL: { value: "all" }
  }
});

var GraphQLViewer = new GraphQLObjectType({
  name: 'Viewer',
  fields: () => ({
    id: globalIdField('Viewer'),
    groupCallInvitationList: {
      type: GraphQLGroupCallInvitationConnection,
      args: {
        filter: {
          type: GraphQLBoolean,
          defaultValue: GraphQLChronoFilter.ALL
        },
        ...connectionArgs,
      },
      resolve: async (viewer, {first, filter}) => {
        let r = thinky.r;
        let queryFilter = {};
        switch (filter) {
          case GraphQLChronoFilter.UPCOMING:
            queryFilter = (row) => row('scheduledTime').gt(new Date());
            break;
          case GraphQLChronoFilter.PAST:
            queryFilter = (row) => row('scheduledTime').lte(new Date());
            break;
        }
        var invitations = await r.table(GroupCall.getTableName())
          .filter(queryFilter)
          .group('groupCallInvitationId')
          .min('scheduledTime')
          .ungroup()
          ('reduction')
          .orderBy('scheduledTime')
          .merge((groupCall) => {
            return {
              invitation: r.table(GroupCallInvitation.getTableName()).get(groupCall('groupCallInvitationId'))
            }
          })
          ('invitation')
          .limit(first)

        return connectionFromArray(invitations, {first});
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
    var maestro = new Maestro('PWC0PU44ZPOHAI9L', '60aedf735b2b6f7cf83f34c8b560ac9b', 'http://myaccount.maestroconference.com/_access');
    groupCallList.forEach((groupCall) => {
      promises.push(GroupCall.save({
        scheduledTime: groupCall.scheduledTime,
        maxSignups: groupCall.maxSignups,
        signups: [],
        groupCallInvitationId: invitation.id
      }));
      promises.push(maestro.createConferenceCall(topic, groupCall.maxSignups, "2015.10.23 05:30:00", 60))
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