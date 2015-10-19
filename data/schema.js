
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
  GroupCallInvitation
} from './models';

var {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    if (type === 'GroupCallInvitation')
      return GroupCallInvitation.get(id)
    else
      return null;
  },
  (obj) => {
    if (obj instanceof GroupCallInvitation)
      return GraphQLGroupCallInvitation;
    else
      return null;
  }
);

function getViewer() {
  return {id: '1'}
}

var GraphQLGroupCallInvitation = new GraphQLObjectType({
  name: 'GroupCallInvitation',
  description: 'An invitation to a number of group calls.',
  fields: () => ({
    id: globalIdField('GroupCallInvitation'),
    topic: {
      type: GraphQLString
    }
  }),
  interfaces: [nodeInterface]
})

var {
  connectionType: GraphQLGroupCallInvitationConnection,
  edgeType: GraphQLGroupCallInvitationEdge
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
      resolve: async (game, args) => {
        var invitations = await GroupCallInvitation.filter({})
        return connectionFromArray(invitations, args);
      }
    }
  }),
  interfaces: [nodeInterface]
})

var GraphQLCreateGroupCallInvitationMutation = mutationWithClientMutationId({
  name: 'CreateGroupCallInvitation',
  inputFields: {
    topic: { type: new GraphQLNonNull(GraphQLString) }
  },
  outputFields: {
    viewer: {
      type: GraphQLViewer,
      resolve: (payload) => {
        console.log(payload);
        return getViewer();
      }
    }
  },
  mutateAndGetPayload: async (input) => {
    console.log(input);
    var invitation = await GroupCallInvitation.save({topic: input.topic})
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