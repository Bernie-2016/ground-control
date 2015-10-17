
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
    console.log('here')
    if (obj instanceof GroupCallInvitation)
      return GraphQLGroupCallInvitation;
    else
      return null;
  }
);

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

var GraphQLViewer = new GraphQLObjectType({
  name: 'Viewer',
  fields: () => ({
    id: globalIdField('Viewer'),
    groupCallInvitationList: {
      type: new GraphQLList(GraphQLGroupCallInvitation),
      resolve: () => {
        console.log("HERERERER")
        return GroupCallInvitation.filter({})
      }
    }
  }),
  interfaces: [nodeInterface]
})

var Root = new GraphQLObjectType({
  name: 'Root',
  fields: () => ({
    viewer: {
      type: GraphQLViewer,
      resolve: () => {
        console.log("how about here?")
        return {}
      }
    },
    node: nodeField
  }),
});

export var Schema = new GraphQLSchema({
  query: Root,
});