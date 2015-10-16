
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

var Root = new GraphQLObjectType({
  name: 'Root',
  fields: () => ({
    groupCallInvitation: {
      type: GraphQLGroupCallInvitation,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (root, {id}) => {
        return GroupCallInvitation.get(id);
      }
    },
    node: nodeField
  }),
});

export var Schema = new GraphQLSchema({
  query: Root,
});