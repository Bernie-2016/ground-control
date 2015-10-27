
import {
  GraphQLBoolean,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLID,
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
  GroupCall
} from './models';

import Maestro from '../maestro';
import Promise from 'bluebird';
import thinky from './thinky';

var {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    if (type === 'GroupCall')
      return GroupCall.get(id);
    else if (type === 'Viewer')
      return getViewer();
    else
      return null;
  },
  (obj) => {
    if (obj instanceof GroupCall)
      return GraphQLGroupCall;
    else
      return GraphQLViewer;
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
    name: { type: GraphQLString },
    scheduledTime: { type: GraphQLInt },
    maxSignups: { type: GraphQLInt }
  }),
  interfaces: [nodeInterface]
});

var {
  connectionType: GraphQLGroupCallConnection,
} = connectionDefinitions({
  name: 'GroupCall',
  nodeType: GraphQLGroupCall
});


var GraphQLViewer = new GraphQLObjectType({
  name: 'Viewer',
  fields: () => ({
    id: globalIdField('Viewer'),
    groupCallList: {
      type: GraphQLGroupCallConnection,
      args: {
       upcoming: {
          type: GraphQLBoolean,
          defaultValue: null
        },
        ...connectionArgs,
      },
      resolve: async (viewer, {first, upcoming}) => {
        let r = thinky.r;
        let queryFilter = {};
        if (upcoming)
          queryFilter = (row) => row('scheduledTime').gt(new Date());
        else if (upcoming == false)
          queryFilter = (row) => row('scheduledTime').le(new Date());

        var calls = await r.table(GroupCall.getTableName())
          .orderBy('scheduledTime')
          .filter(queryFilter)
          .limit(first)

        return connectionFromArray(calls, {first});
      }
    },
    groupCall: {
      type: GraphQLGroupCall,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (viewer, {id}) => {
        let localID = fromGlobalId(id).id;
        var call = await GroupCall.get(localID);
        return call;
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
//  mutation: RootMutation
});