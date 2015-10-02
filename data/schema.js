import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
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
  getPerson,
  allPeople
} from './database';

var {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    if (type === 'Person')
      return getPerson(id);
    else
      return null;
  },
  (obj) => {
    if (obj instanceof Person)
      return personType;
    else
      return null;
  }
);

var personType = new GraphQLObjectType({
  name: 'Person',
  description: 'A person that has at some point signed up',
  fields: () => ({
    id: globalIdField('Person'),
    email: {
      type: GraphQLString,
      description: "A person's e-mail address",
    },
    name: {
      type: GraphQLString,
      description: "A person's name"
    }
  }),
  interfaces: [nodeInterface],
});

var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField,
    person: {
      type: personType,
      args: {
        id: {
          description: 'id',
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: (root, {id}) => { return getPerson(id) }
    },
    persons: {
      type: new GraphQLList(personType),
      resolve: () => {
        return allPeople();
      }
    }
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
