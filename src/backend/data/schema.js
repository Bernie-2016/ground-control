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
  BSDEventType,
  BSDEmail,
  BSDGroup,
  BSDCall,
  BSDCallAssignment,
  BSDAssignedCall,
  BSDSurvey,
  BSDEvent,
  BSDEventAttendee,
  GCBSDGroup,
  GCBSDSurvey,
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
    if (type === 'CallAssignment')
      return BSDCallAssignment.findById(id);
    if (type === 'Survey')
      return GCBSDSurvey.findById(id);
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
    if (obj instanceof GCBSDSurvey)
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
            if (time.hours() > 9 && time.hours() < 21)
              validOffsets.push(offset)
          })
          if (validOffsets.length === 0)
            return null;
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
                addresses.state_cd NOT IN ('IA','NH','NV','SC') AND
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
        return person.getPrimaryPhone()
      }
    },
    email: {
      type: GraphQLString,
      resolve: async (person) => {
        return person.getPrimaryEmail();
      }
    },
    address: {
      type: GraphQLAddress,
      resolve: async (person) => {
        return person.getPrimaryAddress();
      }
    },
    nearbyEvents: {
      type: new GraphQLList(GraphQLEvent),
      args: {
        within: { type: GraphQLInt },
        type: { type: GraphQLString }
      },
      resolve: async (person, {within, type}) => {
        let address = await person.getPrimaryAddress()
        let boundingDistance = within / 69
        let eventTypes = null;
        if (type) {
          eventTypes = await BSDEventType.findAll({
            where: {
              name: {
                $iLike: `%${type}%`
              }
            }
          })
          eventTypes = eventTypes.map((eventType) => eventType.id)
        }

        let query = {
          where: {
            latitude: {
              $between: [address.latitude - boundingDistance, address.latitude + boundingDistance]
            },
            longitude: {
              $between: [address.longitude - boundingDistance, address.longitude + boundingDistance]
            },
            startDate: {
              $gt: new Date()
            }
          }
        };
        if (eventTypes)
          query['where']['event_type_id'] = { $in: eventTypes }

        return BSDEvent.findAll(query)
      }
    }
  }),
  interfaces: [nodeInterface]
})

const GraphQLEventAttendee = new GraphQLObjectType({
  name: 'EventAttendee',
  description: 'An event attendee',
  fields: () => ({
    id: globalIdField('EventAttendee'),
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
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
    attendeeVolunteerShow: { type: GraphQLBoolean },
    attendeeVolunteerMessage: { type: GraphQLString },
    isSearchable: { type: GraphQLInt },
    publicPhone: { type: GraphQLBoolean },
    contactPhone: { type: GraphQLString },
    hostReceiveRsvpEmails: { type: GraphQLBoolean },
    rsvpUseReminderEmail: { type: GraphQLBoolean },
    rsvpReminderHours: { type: GraphQLInt },
    attendeesCount: {
      type: GraphQLInt,
      resolve: async(event) => {
        return BSDEventAttendee.count({
          where: {
            event_id: event.id
          }
        })
      }
    },
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
    fullURL: {
      type: GraphQLString,
      resolve: async (survey) => {
        let underlyingSurvey = await survey.getBSDSurvey();
        let slug = underlyingSurvey.slug;
        return url.resolve('https://' + process.env.BSD_HOST, '/page/s/' + slug)
      }
    },
    renderer: { type: GraphQLString }
  }),
  interfaces: [nodeInterface]
})

const GraphQLSubmitCallSurvey = mutationWithClientMutationId({
  name: 'SubmitCallSurvey',
  inputFields: {
    callAssignmentId: { type: new GraphQLNonNull(GraphQLString) },
    intervieweeId: { type: new GraphQLNonNull(GraphQLString) },
    completed: { type: new GraphQLNonNull(GraphQLBoolean) },
    leftVoicemail: { type: GraphQLBoolean },
    sentText: { type: GraphQLBoolean },
    reasonNotCompleted: { type: GraphQLString },
    surveyFieldValues: { type: new GraphQLNonNull(GraphQLString) }
  },
  outputFields: {
    currentUser: {
      type: GraphQLUser,
    }
  },
  mutateAndGetPayload: async ({callAssignmentId, intervieweeId, completed, leftVoicemail, sentText, reasonNotCompleted, surveyFieldValues}, {rootValue}) => {
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
      }, {transaction: t})

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

      let callAssignment = await BSDCallAssignment.findById(localCallAssignmentId, {transaction: t})
      let survey = await callAssignment.getSurvey({transaction: t})
      let fieldValues = JSON.parse(surveyFieldValues)
      fieldValues['person'] = await BSDPerson.findById(localIntervieweeId, {transaction: t});
      if (completed)
        await survey.process(fieldValues)

      let promises = [
        assignedCall.destroy({transaction: t}),
        BSDCall.create({
          completed: completed,
          attemptedAt: new Date(),
          leftVoicemail: leftVoicemail,
          sentText: sentText,
          reasonNotCompleted: reasonNotCompleted,
          caller_id: caller.id,
          interviewee_id: assignedCall.interviewee_id,
          call_assignment_id: assignedCall.call_assignment_id
        }, {transaction: t})
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
    surveyId: { type: new GraphQLNonNull(GraphQLInt) },
    renderer: { type: new GraphQLNonNull(GraphQLString) },
    processors: { type: new GraphQLList(GraphQLString) }
  },
  outputFields: {
    listContainer: {
      type: GraphQLListContainer,
      resolve: () => SharedListContainer
    }
  },
  mutateAndGetPayload: async ({name, intervieweeGroup, surveyId, renderer, processors}, {rootValue}) => {
    authRequired(rootValue);
    adminRequired(rootValue);
    let groupText = intervieweeGroup;
    let group = null;
    let survey = null;
    return sequelize.transaction(async (t) => {
      let underlyingSurvey = await BSDSurvey.findWithBSDCheck(surveyId, {transaction: t})

      if (!underlyingSurvey)
        throw new GraphQLError({
          status: 400,
          message: 'Provided survey ID does not exist in BSD.'
        });
      survey = await GCBSDSurvey.create({
        signup_form_id: surveyId,
        renderer: renderer,
        processors: processors
      }, {transaction: t})
      if (/^\d+$/.test(groupText)) {
        let underlyingGroup = await BSDGroup.findWithBSDCheck(groupText, {transaction: t})
        if (!underlyingGroup)
          throw new GraphQLError({
            status: 400,
            message: 'Provided group ID does not exist in BSD.'
          });

        let consGroupID = parseInt(groupText, 10);
        group = await GCBSDGroup.findOne({
          where: {
            cons_group_id: consGroupID
          }
        }, {transaction: t})
        if (!group)
          group = await GCBSDGroup.create({
            cons_group_id: consGroupID
          }, {transaction: t})
      }
      else {
        let query = groupText;
        query = query.toLowerCase();

        if (query.indexOf('drop') !== -1)
          throw new GraphQLError({
            status: 400,
            message: 'Cannot use DROP in your SQL'
          })

        group = await GCBSDGroup.findOne({
          where: {
            query: query
          }
        }, {transaction: t})

        if (!group)
          group = await GCBSDGroup.create({
            query: query
          }, {transaction: t})

        if (query !== 'everyone') {
          query = query.replace(/;*$/, '')
          let results = null;
          let limit = 2000;
          let offset = 0;
          let limitedQuery = null;

          query = query.toLowerCase();

          do {
            limitedQuery = `${query} order by cons_id limit ${limit} offset ${offset}`
            try {
              results = await sequelize.query(limitedQuery)
              if (results && results.length > 0) {
                let persons = results[0].map((result) => result.cons_id)
                await group.addPeople(persons, {transaction: t})
              }
              offset = offset + limit;
            } catch (ex) {
              let error = `Invalid SQL query: ${ex.message}`
              throw new GraphQLError({
                status: 400,
                message: error
              })
            }
          } while(results && results.length > 0 && results[0].length > 0)
        }
      }

      return BSDCallAssignment.create({
        name: name,
        gc_bsd_group_id: group.id,
        gc_bsd_survey_id: survey.id
      }, {transaction: t})
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