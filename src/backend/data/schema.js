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
  BSDPerson,
  BSDGroup,
  BSDCallAssignment,
  BSDSurvey,
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
    if (type === 'BSDPerson')
      return BSDPerson.findById(id);
    if (type === 'BSDGroup')
      return BSDGroup.findById(id);
    if (type === 'BSDCallAssignment')
      return BSDCallAssignment.findById(id);
    if (type === 'BSDSurvey')
      return BSDSurvey.findById(id);
    if (type === 'BSDEvent')
      return BSDEvent.findById(id);
    if (type === 'ListContainer')
      return SharedListContainer;
    return null;
  },
  (obj) => {
    if (obj instanceof BSDPerson)
      return GraphQLBSDPerson;
    if (obj instanceof BSDGroup)
      return GraphQLBSDGroup;
    if (obj instanceof BSDCallAssignment)
      return GraphQLBSDCallAssignment;
    if (obj instanceof BSDCall)
      return GraphQLBSDCall;
    if (obj instanceof BSDSurvey)
      return GraphQLBSDSurvey;
    if (obj instanceof ListContainer)
      return GraphQLListContainer;
    if (obj instanceof BSDEvent)
      return GraphQLBSDEvent;
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
      type: GraphQLBSDCallAssignmentConnection,
      args: connectionArgs,
      resolve: async (assignment, {first}) => {
        let assignments = await BSDCallAssignment.all()
        return connectionFromArray(assignments, {first});
      }
    },
  }),
  interfaces: [nodeInterface]
})

const GraphQLBSDPerson = new GraphQLObjectType({
  name: 'BSDPerson',
  description: 'A person.',
  fields: () => ({
    id: globalIdField('BSDPerson'),
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
      type: GraphQLBSDCallAssignmentConnection,
      args: connectionArgs,
      resolve: async (person, {first}) => {
        let assignments = await BSDCallAssignment.all()
        return connectionFromArray(assignments, {first});
      }
    }
  }),
  interfaces: [nodeInterface]
})

let {
  connectionType: GraphQLBSDPersonConnection,
} = connectionDefinitions({
  name: 'BSDPerson',
  nodeType: GraphQLBSDPerson
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

const GraphQLBSDGroup = new GraphQLObjectType({
  name: 'BSDGroup',
  description: 'A list of people as determined by some criteria',
  fields: () => ({
    personList: { type: GraphQLBSDPersonConnection }
  })
});

const GraphQLBSDCallAssignment = new GraphQLObjectType({
  name: 'BSDCallAssignment',
  description: 'A mass calling assignment',
  fields: () => ({
    id: globalIdField('BSDCallAssignment'),
    name: { type: GraphQLString },
    callerGroup: {
      type: GraphQLBSDGroup,
      resolve: (assignment) => assignment.getCallerGroup()
    },
    targetGroup: {
      type: GraphQLBSDGroup,
      resolve: (assignment) => assignment.getTargetGroup()
    },
    survey: {
      type: GraphQLBSDSurvey,
      resolve: (assignment) => assignment.getSurvey()
    },
    targetForUser: {
      type: GraphQLBSDPerson,
      args: {
        personId: { type: GraphQLString }
      },
      resolve: async (assignment, {personId}) => {
        let targetGroup = await assignment.getTargetGroup()
        let people = await targetGroup.getPeople()
        let person = people[Math.floor(Math.random() * people.length)]
        return person
      }
    }
  }),
  interfaces: [nodeInterface]
});

let {
  connectionType: GraphQLBSDCallAssignmentConnection,
} = connectionDefinitions({
  name: 'BSDCallAssignment',
  nodeType: GraphQLBSDCallAssignment
});

const GraphQLBSDSurvey = new GraphQLObjectType({
  name: 'BSDSurvey',
  description: 'A survey to be filled out by a person',
  fields: () => ({
    id: globalIdField('BSDSurvey'),
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

const GraphQLCreateBSDCallAssignment = mutationWithClientMutationId({
  name: 'CreateBSDCallAssignment',
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
      BSDGroup.findById(callerGroupId),
      BSDGroup.findById(targetGroupId),
      BSDSurvey.findById(surveyId)]);
    let BSDFetches = [];
    // Fix this
//    if (!callerGroup)
//      BSDFetches.push(BSDClient.getConstituentGroup(callerGroupId))
//    if (!targetGroup)
//      BSDFetches.push(BSDClient.getConstituentGroup(targetGroupId))
    if (!survey) {
      try {
        let BSDSurveyResponse = await BSDClient.getForm(surveyId)
        survey = await BSDSurvey.createFromBSDObject(BSDSurveyResponse)
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

    let callAssignment = await BSDCallAssignment.create({
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
    createBSDCallAssignment: GraphQLCreateBSDCallAssignment
  })
});

let RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => ({
    // This wrapper is necessary because relay does not support handling connection types in the root query currently. See https://github.com/facebook/relay/issues/112
    currentUser: {
      type: GraphQLBSDPerson,
      resolve: (parent, _, {rootValue}) => {
        if (rootValue.session && rootValue.session.personId)
          return BSDPerson.findById(rootValue.session.personId);
        else
          return null;
      }
    },
    listContainer: {
      type: GraphQLListContainer,
      resolve: () => SharedListContainer
    },
    person: {
      type: GraphQLBSDPerson,
      args: {
        email: { type: GraphQLString }
      },
      resolve: async (root, {email}) => {
        if (!email)
          return null;
        let BSDBSDPerson = await BSDClient.getConstituentByEmail(email)

        if (BSDBSDPerson) {
          let person = await BSDPerson.createFromBSDObject(BSDBSDPerson);
          console.log(person)
          return person
        }
        else
          return null;
      }
    },
    survey: {
      type: GraphQLBSDSurvey,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (root, {id}) => {
        let localId = fromGlobalId(id).id
        return BSDSurvey.findById(localId)
      }
    },
    callAssignment: {
      type: GraphQLBSDCallAssignment,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (root, {id}) => {
        let localId = fromGlobalId(id).id;
        return BSDCallAssignment.findById(localId);
      }
    },
    node: nodeField
  }),
});

export let Schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation
});