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
      return Person.findById(id);
    if (type === 'Group')
      return Group.findById(id);
    if (type === 'CallAssignment')
      return CallAssignment.findById(id);
    if (type === 'Survey')
      return Survey.findById(id);
    if (type === 'Event')
      return Event.findById(id);
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
        let events = await Event.all()
        return connectionFromArray(events, {first});
      }
    },
    callAssignmentList: {
      type: GraphQLCallAssignmentConnection,
      args: connectionArgs,
      resolve: async (assignment, {first}) => {
        let assignments = await CallAssignment.all()
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
    hasPassword: {
      type: GraphQLBoolean,
      resolve: () => {
        return false;
      }
    },
    callAssignmentList: {
      type: GraphQLCallAssignmentConnection,
      args: connectionArgs,
      resolve: async (person, {first}) => {
        let assignments = await CallAssignment.all()
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
      resolve: (assignment) => assignment.getCallerGroup()
    },
    targetGroup: {
      type: GraphQLGroup,
      resolve: (assignment) => assignment.getTargetGroup()
    },
    survey: {
      type: GraphQLSurvey,
      resolve: (assignment) => assignment.getSurvey()
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

const GraphQLSurvey = new GraphQLObjectType({
  name: 'Survey',
  description: 'A survey to be filled out by a person',
  fields: () => ({
    id: globalIdField('Survey'),
    slug: { type: GraphQLString },
    fullURL: {
      type: GraphQLString,
      resolve: (survey) => {
        return url.resolve('https://' + process.env.BSD_HOST, '/page/s/' + survey.slug)
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
      Group.findById(callerGroupId),
      Group.findById(targetGroupId),
      Survey.findById(surveyId)]);
    let BSDFetches = [];
    // Fix this
//    if (!callerGroup)
//      BSDFetches.push(BSDClient.getConstituentGroup(callerGroupId))
//    if (!targetGroup)
//      BSDFetches.push(BSDClient.getConstituentGroup(targetGroupId))
    if (!survey) {
      try {
        let BSDSurvey = await BSDClient.getForm(surveyId)
        survey = await Survey.createFromBSDObject(BSDSurvey)
      } catch(err) {
        if (err && err.response && err.response.statusCode === 409) {
            throw new GraphQLError({
            status: 400,
            message: 'Provided Survey ID does not exist in BSD.'
          });
        }
        else
          throw err;
      }
    }

    /*
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
    */

    let callAssignment = await CallAssignment.create({
      name: name
    })
    return Promise.all([
      callAssignment.setCallerGroup(callerGroup),
      callAssignment.setTargetGroup(targetGroup),
      callAssignment.setSurvey(survey)
    ])
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
        email: { type: GraphQLString }
      },
      resolve: async (root, {email}) => {
        if (!email)
          return null;
        let BSDPerson = await BSDClient.getConstituentByEmail(email)

        if (BSDPerson) {
          return Person.createFromBSDObject(BSDPerson)
        }
        else
          return null;
      }
    },
    survey: {
      type: GraphQLSurvey,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (root, {id}) => {
        let localId = fromGlobalId(id).id
        return Survey.findById(localId)
      }
    },
    callAssignment: {
      type: GraphQLCallAssignment,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (root, {id}) => {
        let localId = fromGlobalId(id).id;
        return CallAssignment.findById(localId);
      }
    },
    node: nodeField
  }),
});

export let Schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation
});