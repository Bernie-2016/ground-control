/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

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
  // Import methods that your schema can use to interact with your database
  Person,
  getPerson,
  allPeople
} from './database';

/**
 * We get the node interface and field from the Relay library.
 *
 * The first method defines the way we resolve an ID to its object.
 * The second defines the way we resolve an object to its GraphQL type.
 */

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

/**
 * Define your own types here
 */

var personType = new GraphQLObjectType({
  name: 'Person',
  description: 'A person that has at some point signed up',
  fields: () => ({
    id: globalIdField('Person'),
    email: {
      type: GraphQLString,
      description: "A person's e-mail address",
    }
  }),
  interfaces: [nodeInterface],
});

/**
 * This is the type that will be the root of our query,
 * and the entry point into our schema.
 */
var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField,
    // Add your own root fields here
    person: {
      type: new GraphQLList(personType),
      resolve: () => {return allPeople() }
    },
  }),
});

/**
 * This is the type that will be the root of our mutations,
 * and the entry point into performing writes in our schema.
 */
//var mutationType = new GraphQLObjectType({
//  name: 'Mutation',
//  fields: () => ({
    // Add your own mutations here
//  })
//});

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */
export var Schema = new GraphQLSchema({
  query: queryType,
  // Uncomment the following after adding some mutation fields:
  // mutation: mutationType
});
