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
  Person,
  Group,
  CallAssignment,
  Survey,
  Event
} from './models';

import moment from 'moment-timezone';
import Promise from 'bluebird';
import Maestro from '../maestro';
import BSD from '../bsd';
import url from 'url';

class GraphQLError extends Error {
  constructor(errorObject) {
    let message = JSON.stringify(errorObject)
    super(message)
    this.name = 'MyError',
    this.message = message,
    Error.captureStackTrace(this, this.constructor.name)
  }
}

class ListContainer {
  constructor(identifier) {
    this.id = identifier
  }
}
const SharedListContainer = new ListContainer(1);

const BSDClient = new BSD(process.env.BSD_HOST, process.env.BSD_API_ID, process.env.BSD_API_SECRET);

let {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    let {type, id} = fromGlobalId(globalId);
    if (type === 'Person')
      return Person.get(id);
    if (type === 'Group')
      return Group.get(id);
    if (type === 'CallAssignment')
      return CallAssignment.get(id);
    if (type === 'Call')
      return Call.get(id);
    if (type === 'Survey')
      return Survey.get(id);
    if (type === 'Event')
      return Event.get(id);
    if (type === 'ListContainer')
      return SharedListContainer;
    return null;
  },
  (obj) => {
    if (obj instanceof Person)
      return GraphQLPerson;
    if (obj instanceof Group)
      return GraphQLGroup;
    if (obj instanceof CallAssignment)
      return GraphQLCallAssignment;
    if (obj instanceof Call)
      return GraphQLCall;
    if (obj instanceof Survey)
      return GraphQLSurvey;
    if (obj instanceof ListContainer)
      return GraphQLListContainer;
    if (obj instanceof Event)
      return GraphQLEvent;
    return null;
  }
);

const GraphQLListContainer = new GraphQLObjectType({
  name: 'ListContainer',
  fields: () => ({
    id: globalIdField('ListContainer'),
    eventList: {
      type: GraphQLEventConnection,
      args: connectionArgs,
      resolve: async(event, {first}) => {
        let events = await Event.filter({})
        return connectionFromArray(events, {first});
      }
    },
    callAssignmentList: {
      type: GraphQLCallAssignmentConnection,
      args: connectionArgs,
      resolve: async (assignment, {first}) => {
        let assignments = await CallAssignment.filter({})
        return connectionFromArray(assignments, {first});
      }
    },
  }),
  interfaces: [nodeInterface]
})

const GraphQLPerson = new GraphQLObjectType({
  name: 'Person',
  description: 'A person.',
  fields: () => ({
    id: globalIdField('Person'),
    firstName: { type: GraphQLString },
    middleName: { type: GraphQLString},
    lastName: { type: GraphQLString },

    callAssignmentList: {
      type: GraphQLCallAssignmentConnection,
      args: connectionArgs,
      resolve: async (person, {first}) => {
        let assignments = await CallAssignment.filter({})
        return connectionFromArray(assignments, {first});
      }
    }
  }),
  interfaces: [nodeInterface]
})

let {
  connectionType: GraphQLPersonConnection,
} = connectionDefinitions({
  name: 'Person',
  nodeType: GraphQLPerson
});

const GraphQLEvent = new GraphQLObjectType({
  name: 'Event',
  description: 'An event',
  fields: () => ({
    id: globalIdField('Event'),
    name: { type: GraphQLString }
  })
})

let {
  connectionType: GraphQLEventConnection,
} = connectionDefinitions({
  name: 'Event',
  nodeType: GraphQLEvent
});

const GraphQLGroup = new GraphQLObjectType({
  name: 'Group',
  description: 'A list of people as determined by some criteria',
  fields: () => ({
    personList: { type: GraphQLPersonConnection }
  })
});

const GraphQLCallAssignment = new GraphQLObjectType({
  name: 'CallAssignment',
  description: 'A mass calling assignment',
  fields: () => ({
    id: globalIdField('CallAssignment'),
    name: { type: GraphQLString },
    callerGroup: {
      type: GraphQLGroup,
      resolve: (assignment) => Group.get(assignment.callerGroupId)
    },
    targetGroup: {
      type: GraphQLGroup,
      resolve: (assignment) => Group.get(assignment.targetGroupId)
    },
    survey: {
      type: GraphQLSurvey,
      resolve: (assignment) => {
        return Survey.get(assignment.surveyId)
      }
    }
  }),
  interfaces: [nodeInterface]
});

let {
  connectionType: GraphQLCallAssignmentConnection,
} = connectionDefinitions({
  name: 'CallAssignment',
  nodeType: GraphQLCallAssignment
});

const GraphQLBSDSurvey = new GraphQLObjectType({
  name: 'BSDSurvey',
  description: 'Underlying survey object in BSD',
  fields: () => ({
    id: { type: GraphQLString },
    fullURL: { type: GraphQLString }
  })
})

const GraphQLSurvey = new GraphQLObjectType({
  name: 'Survey',
  description: 'A survey to be filled out by a person',
  fields: () => ({
    id: globalIdField('Survey'),
    slug: { type: GraphQLString },
    BSDData: {
      type: GraphQLBSDSurvey,
      resolve: async (survey) => {
        if (survey.BSDId) {
          let BSDSurvey = await BSDClient.getForm(survey.BSDId);
          return {
            id: survey.BSDId,
            fullURL: url.resolve('https://' + process.env.BSD_HOST, '/page/s/' + BSDSurvey.signup_form_slug)
          }
        }
        return null;
      }
    }
  }),
  interfaces: [nodeInterface]
})

const GraphQLCreateCallAssignment = mutationWithClientMutationId({
  name: 'CreateCallAssignment',
  inputFields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    callerGroupId: { type: new GraphQLNonNull(GraphQLString) },
    targetGroupId: { type: new GraphQLNonNull(GraphQLString) },
    surveyId: { type: new GraphQLNonNull(GraphQLString) },
//    startDate: new GraphQLNonNull(GraphQLInt),
//    endDate: GraphQLInt
  },
  outputFields: {
    listContainer: {
      type: GraphQLListContainer,
      resolve: () => SharedListContainer
    }
  },
  mutateAndGetPayload:async ({name, callerGroupId, targetGroupId, surveyId, startDate, endDate}) => {
    let [callerGroup, targetGroup, survey] = await Promise.all([
      Group.filter({BSDId: callerGroupId}),
      Group.filter({BSDId: targetGroupId}),
      Survey.filter({BSDId: surveyId})]);
    callerGroup = callerGroup[0]
    targetGroup = targetGroup[0]
    survey = survey[0]
    let BSDFetches = [];
    if (!callerGroup)
      BSDFetches.push(BSDClient.getConstituentGroup(callerGroupId))
    if (!targetGroup)
      BSDFetches.push(BSDClient.getConstituentGroup(targetGroupId))
    if (!survey)
      BSDFetches.push(BSDClient.getForm(surveyId));
    // Just to verify these BSD IDs exist
    try {
      await Promise.all(BSDFetches);
    } catch(err) {
      if (err && err.response && err.response.statusCode === 409) {
        throw new GraphQLError({
          status: 400,
          message: 'One of BSD IDs provided was not found in BSD.'
        });
      }
      else
        throw err;
    }

    let savePromises = []
    if (!survey)
      survey = await Survey.save({
        BSDId: surveyId
      })
    if (!callerGroup) {
      callerGroup = await Group.save({
        BSDId: callerGroupId,
        personIdList: []
      })
    }
    if (!targetGroup) {
      targetGroup = await Group.save({
        BSDId: targetGroupId,
        personIdList: []
      })
    }

    return CallAssignment.save({
      name: name,
      callerGroupId: callerGroup.id,
      targetGroupId: targetGroup.id,
      surveyId: survey.id,
    })
  }
});

let RootMutation = new GraphQLObjectType({
  name: 'RootMutation',
  fields: () => ({
    createCallAssignment: GraphQLCreateCallAssignment
  })
});

let RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => ({
    // This wrapper is necessary because relay does not support handling connection types in the root query currently. See https://github.com/facebook/relay/issues/112
    currentUser: {
      type: GraphQLPerson,
      resolve: () => {
        //return Person.get('5c1609da-449b-4a44-9a60-b95ae9f97541');
        return null;
      }
    },
    listContainer: {
      type: GraphQLListContainer,
      resolve: () => SharedListContainer
    },
    person: {
      type: GraphQLPerson,
      args: {
        id: { type: GraphQLString },
        email: { type: GraphQLString }
      },
      resolve: async (root, {id, email}) => {
        if (id) {
          let localId = fromGlobalId(id).id
          return Person.get(localId)
        }
        else if (email) {
          let BSDPerson = await BSDClient.getConstituentByEmail(email)

          if (BSDPerson) {
            return Person.createFromBSDConstituent(BSDPerson)
          }
          else
            return null;
        }
      }
    },
    survey: {
      type: GraphQLSurvey,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (root, {id}) => {
        let localId = fromGlobalId(id).id
        return Survey.get(localId)
      }
    },
    callAssignment: {
      type: GraphQLCallAssignment,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (root, {id}) => {
        let localId = fromGlobalId(id).id;
        return CallAssignment.get(localId);
      }
    },
    node: nodeField
  }),
});

export let Schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation
});