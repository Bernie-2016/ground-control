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
  Event,
  User
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
      return BSDPerson.findById(id);
    if (type === 'Group')
      return BSDGroup.findById(id);
    if (type === 'CallAssignment')
      return BSDCallAssignment.findById(id);
    if (type === 'Survey')
      return BSDSurvey.findById(id);
    if (type === 'Event')
      return BSDEvent.findById(id);
    if (type === 'User')
      return User.findById(id);
    if (type === 'ListContainer')
      return SharedListContainer;
    return null;
  },
  (obj) => {
    if (obj instanceof BSDPerson)
      return GraphQLPerson;
    if (obj instanceof BSDGroup)
      return GraphQLGroup;
    if (obj instanceof BSDCallAssignment)
      return GraphQLCallAssignment;
    if (obj instanceof BSDCall)
      return GraphQLCall;
    if (obj instanceof BSDSurvey)
      return GraphQLSurvey;
    if (obj instanceof ListContainer)
      return GraphQLListContainer;
    if (obj instanceof BSDEvent)
      return GraphQLEvent;
    if (obj instanceof User)
      return GraphQLUser;
    return null;
  }
);

const GraphQLListContainer = new GraphQLObjectType({
  name: 'ListContainer',
  fields: () => ({
    id: globalIdField('ListContainer'),
    events: {
      type: GraphQLEventConnection,
      args: connectionArgs,
      resolve: async(event, {first}) => {
        let events = await Event.all()
        return connectionFromArray(events, {first});
      }
    },
    callAssignments: {
      type: GraphQLCallAssignmentConnection,
      args: connectionArgs,
      resolve: async (root, {first}) => {
        let assignments = await BSDCallAssignment.all()
        return connectionFromArray(assignments, {first});
      }
    },
  }),
  interfaces: [nodeInterface]
})

const GraphQLUser = new GraphQLObjectType({
  name: 'User',
  description: "User of ground control",
  fields: () => ({
    id: globalIdField('User'),
    callAssignments: {
      type: GraphQLCallAssignmentConnection,
      args: connectionArgs,
      resolve: async (person, {first}) => {
        let assignments = await BSDCallAssignment.all()
        return connectionFromArray(assignments, {first});
      }
    }
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
    BSDId: { type: GraphQLInt },
    eventIdObfuscated: { type: GraphQLString },
    flagApproval: { type: GraphQLBoolean },
    eventTypeId: { type: GraphQLInt },
    creatorConsId: { type: GraphQLInt },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    venueName: { type: GraphQLString },
    venueZip: { type: GraphQLString },
    venueCity: { type: GraphQLString },
    venueState: { type: GraphQLString },
    venueAddr1: { type: GraphQLString },
    venueAddr2: { type: GraphQLString },
    venueCountry: { type: GraphQLString },
    venueDirections: { type: GraphQLString },
    localTimezone: { type: GraphQLString },
    startDatetime: { type: GraphQLString },
    duration: { type: GraphQLInt },
    capacity: { type: GraphQLInt },
    attendeeVolunteerShow: { type: GraphQLBoolean },
    attendeeVolunteerMessage: { type: GraphQLString },
    isSearchable: { type: GraphQLInt },
    publicPhone: { type: GraphQLBoolean },
    contactPhone: { type: GraphQLString },
    hostReceiveRsvpEmails: { type: GraphQLBoolean },
    rsvpUseReminderEmail: { type: GraphQLBoolean },
    rsvpReminderHours: { type: GraphQLInt }
  }),
  interfaces: [nodeInterface]
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
    },
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
    createCallAssignment: GraphQLCreateCallAssignment
  })
});

let RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => ({
    // This wrapper is necessary because relay does not support handling connection types in the root query currently. See https://github.com/facebook/relay/issues/112
    listContainer: {
      type: GraphQLListContainer,
      resolve: () => SharedListContainer
    },
    currentUser: {
      type: GraphQLUser,
      resolve: (parent, _, {rootValue}) => {
        return rootValue.user
      }
    },
    callAssignment: {
      type: GraphQLCallAssignment,
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