
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

import moment from 'moment-timezone';
import Promise from 'bluebird';
import Maestro from '../maestro';
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
    else if (obj instanceof Viewer)
      return GraphQLViewer;
    else
      return null;
  }
);

// This is a dummy object because Relay can't handle having connections on the root query fields.
class Viewer extends Object {}
var viewer = new Viewer();
viewer.id = '1';

function getViewer() {
  return viewer;
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
    name: { type: new GraphQLNonNull(GraphQLString) },
    scheduledTime: { type: new GraphQLNonNull(GraphQLInt) },
    maxSignups: { type: new GraphQLNonNull(GraphQLInt) },
    duration: { type: new GraphQLNonNull(GraphQLInt) }
  }
})

var GraphQLBatchCreateGroupCallMutation = mutationWithClientMutationId({
  name: 'BatchCreateGroupCall',
  inputFields: {
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
  mutateAndGetPayload:async ({topic, groupCallList}) => {
    var promises = [];
    var maestro = new Maestro(process.env.MAESTRO_UID, process.env.MAESTRO_TOKEN, process.env.MAESTRO_URL, !process.env.DEBUG);

    for (let index = 0; index < groupCallList.length; index++) {
      let groupCall = groupCallList[index];
      let response = await maestro.createConferenceCall(groupCall.name, groupCall.maxSignups, moment(groupCall.scheduledTime).tz("America/Los_Angeles").format("YYYY.MM.DD HH:mm:ss"), groupCall.duration)

      promises.push(GroupCall.save({
        name: groupCall.name,
        scheduledTime: groupCall.scheduledTime,
        maxSignups: groupCall.maxSignups,
        duration: groupCall.duration,
        maestroConferenceUID: 'test',//response.value.UID,
        signups: []
      }));
    };

//    throw new Error("This is a test")
    await Promise.all(promises);
    return {};
  }
});

var RootMutation = new GraphQLObjectType({
  name: 'RootMutation',
  fields: () => ({
    batchCreateGroupCall: GraphQLBatchCreateGroupCallMutation
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