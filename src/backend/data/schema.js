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
  GCBSDGroup,
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
        let assignedCalls = await user.getAssignedCalls({
          where: {
            call_assignment_id: localId
          },
        })
        let assignedCall = assignedCalls[0]
        let callAssignment = await BSDCallAssignment.findById(localId);
        if (assignedCall) {
          let interviewee = await assignedCall.getInterviewee()
          return interviewee
        }
        else {
          let allOffsets = [-10, -9, -8, -7, -6, -5, -4]
          let validOffsets = []
          allOffsets.forEach((offset) => {
            let time = moment().utcOffset(offset)
            if (time.hours() > 10 && time.hours() < 21)
              validOffsets.push(offset)
          })
          // This is maybe the worst thing of all time. Switch to knex when we can.
          let group = await callAssignment.getIntervieweeGroup();
          let filterQuery = '';
          if (group.cons_group_id)
            filterQuery = `
              INNER JOIN (
                  SELECT id, cons_id
                  FROM bsd_person_bsd_groups
                  WHERE cons_group_id=${group.cons_group_id}
                ) AS cons_groups
                ON persons.cons_id=cons_groups.cons_id'
            `
          else if (group.query && group.query !== 'EVERYONE')
            filterQuery = `
              INNER JOIN (
                  ${group.query}
                ) AS inner_query
                ON persons.cons_id=inner_query.cons_id
            `
          let query = `
            SELECT *
            FROM bsd_people AS persons
            INNER JOIN bsd_emails AS emails
              ON persons.cons_id=emails.cons_id
            INNER JOIN bsd_phones AS phones
              ON persons.cons_id=phones.cons_id
            INNER JOIN (
              SELECT id, cons_id
              FROM bsd_addresses AS addresses
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
            ${filterQuery}
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
            RANDOM() < 0.01
            LIMIT 1
          `

          let persons = await sequelize.query(query, {
            replacements: {
              assignmentId: localId,
              lastCalledDate: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
            },
          })
          if (persons && persons.length > 0 && persons[0].length > 0) {
            let person = persons[0][0]
            // Also a big hack - not sure how to convert fieldnames to model attributes without doing it explicitly.  We should maybe just switch to using snake case model attributes and get rid of all the manual conversion code.
            person = BSDPerson.build({
              ...person,
              id: person.cons_id,
              firstName: person.firstname,
              middleName: person.middlename,
              lastName: person.lastname,
              birthDate: person.birth_dt,
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
    query: {
      type: GraphQLString,
      resolve: async (assignment) => {
        let group = await assignment.getIntervieweeGroup();
        if (group.cons_group_id) {
          return 'BSD Constituent Group: ' + group.cons_group_id
        }
        else
          return group.query
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

const GraphQLSurveyInput = new GraphQLInputObjectType({
  name: 'SurveyInput',
  fields: () => ({
    id: globalIdField('Survey'),
    fieldValues: { type: GraphQLString }
  })
})

const GraphQLSubmitCallSurvey = mutationWithClientMutationId({
  name: 'SubmitCallSurvey',
  inputFields: {
    callAssignmentId: { type: new GraphQLNonNull(GraphQLString) },
    intervieweeId: { type: new GraphQLNonNull(GraphQLString) },
    completed: { type: new GraphQLNonNull(GraphQLBoolean) },
    leftVoicemail: { type: GraphQLBoolean },
    sentText: { type: GraphQLBoolean },
    reasonNotCompleted: { type: GraphQLString }
  },
  outputFields: {
    currentUser: {
      type: GraphQLUser,
    }
  },
  mutateAndGetPayload: async ({callAssignmentId, intervieweeId, completed, leftVoicemail, sentText, reasonNotCompleted}, {rootValue}) => {
    authRequired(rootValue);
    let caller = rootValue.user;
    let localIntervieweeId = parseInt(fromGlobalId(intervieweeId).id, 10);
    let localCallAssignmentId = parseInt(fromGlobalId(callAssignmentId).id, 10);
    return sequelize.transaction(async (t) => {
      // To ensure that the assigned call exists
      let assignedCall = await BSDAssignedCall.findOne({
        where: {
          caller_id: caller.id
        }
      })

      let assignedCallInfo = {
        callerId: assignedCall.caller_id,
        intervieweeId: assignedCall.interviewee_id,
        callAssignmentId: assignedCall.call_assignment_id
      }

      let submittedCallInfo = {
        callerId: caller.id,
        intervieweeId: localIntervieweeId,
        callAssignmentId: localCallAssignmentId
      }

      Object.keys(assignedCallInfo).forEach((key) => {
        if (assignedCallInfo[key] !== submittedCallInfo[key]) {
          throw new Error('Assigned call does not match submitted call info.\n assignedCallInfo:' + JSON.stringify(assignedCallInfo) + '\nsubmittedCallInfo:' + JSON.stringify(submittedCallInfo))
        }
      });

      let promises = [
        assignedCall.destroy(),
        BSDCall.create({
          completed: completed,
          attemptedAt: new Date(),
          leftVoicemail: leftVoicemail,
          sentText: sentText,
          reasonNotCompleted: reasonNotCompleted,
          caller_id: caller.id,
          interviewee_id: assignedCall.interviewee_id,
          call_assignment_id: assignedCall.call_assignment_id
        })
      ]
      await Promise.all(promises);
      return caller;
    })
  }
})

const GraphQLCreateCallAssignment = mutationWithClientMutationId({
  name: 'CreateCallAssignment',
  inputFields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    intervieweeGroup: { type: new GraphQLNonNull(GraphQLString) },
    surveyId: { type: new GraphQLNonNull(GraphQLString) },
  },
  outputFields: {
    listContainer: {
      type: GraphQLListContainer,
      resolve: () => SharedListContainer
    }
  },
  mutateAndGetPayload: async ({name, intervieweeGroup, surveyId}, {rootValue}) => {
    adminRequired(rootValue);
    let groupText = intervieweeGroup;
    let group = null;
    return sequelize.transaction(async (t) => {
      if (/^\d+$/.test(groupText)) {
        let underlyingGroup = await BSDGroup.findWithBSDCheck(groupText)
        if (!underlyingGroup)
          throw new GraphQLError({
            status: 400,
            message: 'Provided group ID does not exist in BSD.'
          });
        group = await GCBSDGroup.create({
          cons_group_id: parseInt(groupText, 10)
        })
      }
      else {
        let query = groupText;
        if (query.toLowerCase().indexOf('drop') !== -1)
          throw new GraphQLError({
            status: 400,
            message: 'Cannot use DROP in your SQL'
          })
        if (query.toUpperCase() === 'EVERYONE')
          query = query.toUpperCase()

        if (query !== 'EVERYONE') {
          let results = await sequelize.query(query)
          if (!results || !results.length)
            throw new GraphQLError({
              status: 400,
              message: 'Invalid SQL query'
            })
          if (results[0].length === 0)
            throw new GraphQLError({
              status: 400,
              message: 'SQL query returns no results'
            })
          let firstResult = results[0][0];
          if (!firstResult.cons_id)
            throw new GraphQLError({
              status: 400,
              message: 'SQL query needs to return a list of cons_ids'
            })
        }
        group = await GCBSDGroup.create({
          query: query
        })
      }

      let survey = await BSDSurvey.findWithBSDCheck(surveyId)

      if (!survey)
        throw new GraphQLError({
          status: 400,
          message: 'Provided survey ID does not exist in BSD.'
        });

      return BSDCallAssignment.create({
        name: name,
        gc_bsd_group_id: group.id,
        signup_form_id: survey.id
      })
    })
  }
});

let RootMutation = new GraphQLObjectType({
  name: 'RootMutation',
  fields: () => ({
    submitCallSurvey: GraphQLSubmitCallSurvey,
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