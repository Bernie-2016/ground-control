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
  GraphQLEnumType,
  GraphQLFloat
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
  BSDPhone,
  BSDAddress,
  BSDEmail,
  BSDGroup,
  BSDCall,
  BSDCallAssignment,
  BSDAssignedCall,
  BSDSurvey,
  BSDEvent,
  ZipCode,
  User,
  sequelize
} from './models';

import moment from 'moment-timezone';
import Promise from 'bluebird';
import Maestro from '../maestro';
import url from 'url';
import TZLookup from 'tz-lookup';

class GraphQLError extends Error {
  constructor(errorObject) {
    let message = JSON.stringify(errorObject)
    super(message)
    this.name = 'MyError',
    this.message = message,
    Error.captureStackTrace(this, this.constructor.name)
  }
}

const authRequired = (session) => {
  if (!session.user) {
    throw new GraphQLError({
      status: 401,
      message: 'You must login to access that resource.'
    });
  }
}

const adminRequired = (session) => {
  if (!session.user || !session.user.isAdmin) {
    throw new GraphQLError({
      status: 404,
      message: 'Nothing here.'
    });
  }
}

class ListContainer {
  constructor(identifier) {
    this.id = identifier
  }
}
const SharedListContainer = new ListContainer(1);
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
    if (type === 'Address')
      return BSDAddress.findById(id);
    if (type === 'ListContainer')
      return SharedListContainer;
    return null;
  },
  (obj) => {
    if (obj instanceof BSDPerson)
      return GraphQLPerson;
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
    if (obj instanceof BSDAddress)
      return GraphQLAddress;
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
        let events = await BSDEvent.all()
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
  description: 'User of ground control',
  fields: () => ({
    id: globalIdField('User'),
    callAssignments: {
      type: GraphQLCallAssignmentConnection,
      args: connectionArgs,
      resolve: async (user, {first}) => {
        let assignments = await BSDCallAssignment.all()
        return connectionFromArray(assignments, {first});
      }
    },
    intervieweeForCallAssignment: {
      type: GraphQLPerson,
      args: {
        callAssignmentId: { type: GraphQLString }
      },
      resolve: async (user, {callAssignmentId}) => {
        let localId = fromGlobalId(callAssignmentId).id;
        let interviewee = await user.getAssignedCalls({
          where: {
            call_assignment_id: localId
          },
        })[0]

        if (interviewee)
          return interviewee
        else {
          let allOffsets = [-10, -9, -8, -7, -6, -5, -4]
          let validOffsets = []
          allOffsets.forEach((offset) => {
            let time = moment().utcOffset(offset)
            if (time.hours() > 10 && time.hours() < 21)
              validOffsets.push(offset)
          })
          // This is maybe the worst thing of all time. Switch to knex when we can.
          let persons = await sequelize.query(`
            SELECT *
            FROM bsd_cons AS persons
            INNER JOIN bsd_cons_email AS emails
              ON persons.cons_id=emails.cons_id
            INNER JOIN bsd_cons_phone AS phones
              ON persons.cons_id=phones.cons_id
            INNER JOIN (
              SELECT id, cons_id
              FROM bsd_cons_addr AS addresses
              INNER JOIN zip_codes AS zip_codes
              ON zip_codes.zip=addresses.zip
              WHERE
                addresses.zip NOT BETWEEN '50001' AND '52809' AND
                addresses.zip NOT BETWEEN '68119' AND '68120' AND
                addresses.zip NOT BETWEEN '03031' AND '03897' AND
                addresses.zip NOT BETWEEN '29001' AND '29948' AND
                zip_codes.timezone_offset IN (${validOffsets.join(',')})
              ) AS addresses
              ON persons.cons_id=addresses.cons_id
            LEFT OUTER JOIN bsd_assigned_calls AS assigned_calls
              ON persons.cons_id=assigned_calls.interviewee_id
            LEFT OUTER JOIN (
              SELECT id, interviewee_id
              FROM bsd_calls
              WHERE
                call_assignment_id = :assignmentId AND
                attempted_at > :lastCalledDate
              ) AS calls
              ON persons.cons_id=calls.interviewee_id
            WHERE
              calls.id IS NULL AND
              assigned_calls.id IS NULL
            ORDER BY RANDOM()
            LIMIT 1
          `, {
            replacements: {
              assignmentId: localId,
              lastCalledDate: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
            },
          })
          if (persons && persons.length > 0 && persons[0].length > 0) {
            let person = persons[0][0]
            person = BSDPerson.build({
              ...person,
              id: person.cons_id,
              created_at: person.create_dt,
              updated_at: person.modified_dt,
            })
            let assignedCall = await BSDAssignedCall.create({
              caller_id: user.id,
              interviewee_id: person.id,
              call_assignment_id: localId
            })
            return person
          }
        }
      }
    }
  }),
  interfaces: [nodeInterface]
})

const GraphQLAddress = new GraphQLObjectType({
  name: 'Address',
  description: 'An address',
  fields: () => ({
    id: globalIdField('Address'),
    line1: { type: GraphQLString },
    line2: { type: GraphQLString },
    line3: { type: GraphQLString },
    city: { type: GraphQLString },
    state: { type: GraphQLString },
    zip: { type: GraphQLString },
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
    localTime: {
      type: GraphQLString,
      resolve: async (address) => {
        let tz = TZLookup(address.latitude, address.longitude)
        return moment().tz(tz).format();
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
    prefix: { type: GraphQLString },
    firstName: { type: GraphQLString },
    middleName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    suffix: { type: GraphQLString },
    gender: { type: GraphQLString },
    birthDate: { type: GraphQLString },
    title: { type: GraphQLString },
    employer: { type: GraphQLString },
    occupation: { type: GraphQLString },
    phone: {
      type: GraphQLString,
      resolve: async (person) => {
        let phones = await person.getCached('phones')
        let phone = phones[0].phone
        phones.forEach((phoneObj) => {
          if (phoneObj.isPrimary)
            phone = phoneObj.phone;
        })
        return phone;
      }
    },
    email: {
      type: GraphQLString,
      resolve: async (person) => {
        let emails = await person.getCached('emails')
        let email = emails[0].email
        emails.forEach((emailObj) => {
          if (emailObj.isPrimary)
            email = emailObj.email;
        })
        return email;
      }
    },
    address: {
      type: GraphQLAddress,
      resolve: async (person) => {
        let addresses = await person.getCached('addresses')
        let address = addresses[0].address
        addresses.forEach((addressObj) => {
          if (addressObj.isPrimary)
            address = addressObj;
        })
        return address;
      }
    }
  }),
  interfaces: [nodeInterface]
})

const GraphQLEvent = new GraphQLObjectType({
  name: 'Event',
  description: 'An event',
  fields: () => ({
    id: globalIdField('Event'),
    eventIdObfuscated: { type: GraphQLString },
    flagApproval: { type: GraphQLBoolean },
    eventTypeId: { type: GraphQLInt },
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
    startDate: { type: GraphQLString },
    duration: { type: GraphQLInt },
    capacity: { type: GraphQLInt },
    attendeeVolunteerShow: { type: GraphQLBoolean },
    attendeeVolunteerMessage: { type: GraphQLString },
    isSearchable: { type: GraphQLInt },
    publicPhone: { type: GraphQLBoolean },
    contactPhone: { type: GraphQLString },
    hostReceiveRsvpEmails: { type: GraphQLBoolean },
    rsvpUseReminderEmail: { type: GraphQLBoolean },
    rsvpReminderHours: { type: GraphQLInt },
  }),
  interfaces: [nodeInterface]
})

let {
  connectionType: GraphQLEventConnection,
} = connectionDefinitions({
  name: 'Event',
  nodeType: GraphQLEvent
});

const GraphQLCallAssignment = new GraphQLObjectType({
  name: 'CallAssignment',
  description: 'A mass calling assignment',
  fields: () => ({
    id: globalIdField('CallAssignment'),
    name: { type: GraphQLString },
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
    intervieweeGroupId: { type: new GraphQLNonNull(GraphQLString) },
    surveyId: { type: new GraphQLNonNull(GraphQLString) },
  },
  outputFields: {
    listContainer: {
      type: GraphQLListContainer,
      resolve: () => SharedListContainer
    }
  },
  mutateAndGetPayload: async ({name, intervieweeGroupId, surveyId}, {rootValue}) => {
    adminRequired(rootValue);
    let [intervieweeGroup, survey] = await Promise.all([
        BSDGroup.findWithBSDCheck(intervieweeGroupId),
        BSDSurvey.findWithBSDCheck(surveyId)
      ]);
    if (!intervieweeGroup)
      throw new GraphQLError({
        status: 400,
        message: 'Provided group ID does not exist in BSD.'
      });

    if (!survey)
      throw new GraphQLError({
        status: 400,
        message: 'Provided survey ID does not exist in BSD.'
      });


    let callAssignment = await BSDCallAssignment.create({
      name: name,
    })

    return Promise.all([
      callAssignment.setIntervieweeGroup(intervieweeGroup),
      callAssignment.setSurvey(survey)
    ])
  }
});

let RootMutation = new GraphQLObjectType({
  name: 'RootMutation',
  fields: () => ({
    createCallAssignment: GraphQLCreateCallAssignment,
  })
});

let RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => ({
    // This wrapper is necessary because relay does not support handling connection types in the root query currently. See https://github.com/facebook/relay/issues/112
    listContainer: {
      type: GraphQLListContainer,
      resolve: (parent, _, {rootValue}) => {
        adminRequired(rootValue);
        return SharedListContainer
      }
    },
    currentUser: {
      type: GraphQLUser,
      resolve: (parent, _, {rootValue}) => {
        authRequired(rootValue)
        return rootValue.user
      }
    },
    callAssignment: {
      type: GraphQLCallAssignment,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (root, {id}, {rootValue}) => {
        authRequired(rootValue);
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