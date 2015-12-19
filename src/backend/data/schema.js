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

import moment from 'moment-timezone';
import Promise from 'bluebird';
import Maestro from '../maestro';
import url from 'url';
import TZLookup from 'tz-lookup';
import BSDClient from '../bsd-instance';
import knex from './knex';
import DataLoader from 'dataloader';

const EVERYONE_GROUP = 'everyone';

class GraphQLError extends Error {
  constructor(errorObject) {
    let message = JSON.stringify(errorObject);
    super(message);

    this.name = 'GraphQLError',
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
};

const adminRequired = (session) => {
  authRequired(session);
  if (!session.user || !session.user.isAdmin) {
    throw new GraphQLError({
      status: 403,
      message: 'You are not authorized to access that resource.'
    });
  }
};

// We should move these into model-helpers or something
function getPrimaryEmail(person) {
  return knex('bsd_emails').where({
    is_primary: true,
    cons_id: person.cons_id
  }).first()
}

function getPrimaryAddress(person) {
  return knex('bsd_addresses').where({
    is_primary: true,
    cons_id: person.cons_id
  }).first()
}

function getPrimaryPhone(person) {
  return knex('bsd_phones').where({
    is_primary: true,
    cons_id: person.cons_id
  }).first()
}

const SharedListContainer = {
  id: 1,
  _type: 'list_container'
}

let {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    let {type, id} = fromGlobalId(globalId);
    if (type === 'Person')
      return knex('bsd_people').where('cons_id', id);
    if (type === 'CallAssignment')
      return knex('bsd_call_assignments').where('id', id);
    if (type === 'Survey')
      return knex('gc_bsd_surveys').where('id', id);
    if (type === 'EventType')
      return knex('bsd_event_types').where('id', id);
    if (type === 'Event')
      return knex('bsd_events').where('event_id', id);
    if (type === 'User')
      return knex('users').where('id', id);
    if (type === 'Address')
      return knex('bsd_addresses').where('id', id);
    if (type === 'ListContainer')
      return SharedListContainer;
    return null;
  },
  (obj) => {
    if (obj._type === 'users')
      return GraphQLUser;
    if (obj._type === 'bsd_call_assignments')
      return GraphQLCallAssignment;
    if (obj._type === 'bsd_calls')
      return GraphQLCall;
    if (obj._type === 'gc_bsd_surveys')
      return GraphQLSurvey;
    if (obj._type === 'list_container')
      return GraphQLListContainer;
    if (obj._type === 'bsd_event_types')
      return GraphQLEventType;
    if (obj._type === 'bsd_events')
      return GraphQLEvent;
    if (obj._type === 'bsd_addresses')
      return GraphQLAddress;
    if (obj._type == 'users')
      return GraphQLUser;
    return null;
  }
);

const GraphQLListContainer = new GraphQLObjectType({
  name: 'ListContainer',
  fields: () => ({
    id: globalIdField('ListContainer'),
    eventTypes: {
      type: GraphQLEventTypeConnection,
      args: connectionArgs,
      resolve: async (eventType, {first}, rootValue) => {
        let eventTypes = await knex('bsd_event_types').limit(first)
        return connectionFromArray(eventTypes)
      }
    },
    events: {
      type: GraphQLEventConnection,
      args: connectionArgs,
      resolve: async (event, {first}, rootValue) => {
        let events = await knex('bsd_events').limit(first).orderBy('start_dt', 'asc')
        return connectionFromArray(events, {first});
      }
    },
    callAssignments: {
      type: GraphQLCallAssignmentConnection,
      args: connectionArgs,
      resolve: async (root, {first}, rootValue) => {
        let assignments = await knex('bsd_call_assignments').limit(first);
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
        let assignments = await knex('bsd_call_assignments').limit(first);
        return connectionFromArray(assignments, {first});
      }
    },
    callsMade: {
      type: GraphQLInt,
      args: {
        forAssignmentId: { type: GraphQLString }
      },
      resolve: (user, {forAssignmentId}) => {
        if (forAssignmentId) {
          let localId = fromGlobalId(forAssignmentId)
          return knex('bsd_calls').count(1).where({
            caller_id: user.id,
            call_assignment_id: localId
          })
        }
        else
          return knex('bsd_calls').count(1).where({
            caller_id: user.id
          })
      }
    },
    intervieweeForCallAssignment: {
      type: GraphQLPerson,
      args: {
        callAssignmentId: { type: GraphQLString }
      },
      resolve: async (user, {callAssignmentId}) => {
        return null;
/*        let localId = parseInt(fromGlobalId(callAssignmentId).id, 10);
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
                  SELECT cons_id
                  FROM bsd_person_bsd_groups
                  WHERE cons_group_id=${group.cons_group_id}
                ) AS cons_groups
                ON people.cons_id=cons_groups.cons_id
            `
          else if (group.query && group.query !== EVERYONE_GROUP)
            filterQuery = `
              INNER JOIN (
                  SELECT cons_id
                  FROM bsd_person_gc_bsd_groups
                  WHERE gc_bsd_group_id=${group.id}
                ) AS groups
                ON people.cons_id=groups.cons_id
            `
          let query = `
            SELECT *
            FROM bsd_people AS people
            INNER JOIN bsd_emails AS emails
              ON people.cons_id=emails.cons_id
            INNER JOIN bsd_phones AS phones
              ON people.cons_id=phones.cons_id
            INNER JOIN (
              SELECT id, cons_id
              FROM bsd_addresses AS addresses
              INNER JOIN zip_codes AS zip_codes
              ON zip_codes.zip=addresses.zip
              WHERE
                addresses.is_primary=TRUE AND
                addresses.state_cd NOT IN ('IA','NH','NV','SC') AND
                zip_codes.timezone_offset IN (${validOffsets.join(',')})
              ) AS addresses
              ON people.cons_id=addresses.cons_id
            ${filterQuery}
            LEFT OUTER JOIN bsd_assigned_calls AS assigned_calls
              ON people.cons_id=assigned_calls.interviewee_id
            LEFT OUTER JOIN (
              SELECT id, interviewee_id, attempted_at
              FROM bsd_calls
              WHERE
                (
                  call_assignment_id = :assignmentId AND
                  completed = TRUE
                ) OR
                (
                  reason_not_completed IN ('NO_PICKUP', 'CALL_BACK', 'NOT_INTERESTED') AND
                  attempted_at > :backoffTime
                ) OR
                (
                  reason_not_completed IN ('WRONG_NUMBER', 'DISCONNECTED_NUMBER', 'OTHER_LANGUAGE')
                ) OR
                (
                  call_assignment_id = :assignmentId AND
                  reason_not_completed = 'NOT_INTERESTED'
                )
              ) AS calls
              ON people.cons_id=calls.interviewee_id
            WHERE
              phones.is_primary=TRUE AND
              emails.is_primary=TRUE AND
              calls.id IS NULL AND
              assigned_calls.id IS NULL
            LIMIT 1
          `

          let people = await sequelize.query(query, {
            replacements: {
              assignmentId: localId,
              backoffTime: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
            },
          })
          if (people && people.length > 0 && people[0].length > 0) {
            let person = people[0][0]
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
        */
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
    addr1: { type: GraphQLString },
    addr2: { type: GraphQLString },
    addr3: { type: GraphQLString },
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
    firstName: {
      type: GraphQLString,
      resolve: (person) => person.firstname
    },
    middleName: {
      type: GraphQLString,
      resolve: (person) => person.middlename
    },
    lastName: {
      type: GraphQLString,
      resolve: (person) => person.lastname
    },
    suffix: { type: GraphQLString },
    gender: { type: GraphQLString },
    birthDate: {
      type: GraphQLString,
      resolve: (person) => person.birth_dt
    },
    title: { type: GraphQLString },
    employer: { type: GraphQLString },
    occupation: { type: GraphQLString },
    phone: {
      type: GraphQLString,
      resolve: async (person) => {
        return getPrimaryPhone(person);
      }
    },
    email: {
      type: GraphQLString,
      resolve: async (person, _, rootValue) => {
        return getPrimaryEmail(person)
      }
    },
    address: {
      type: GraphQLAddress,
      resolve: async (person) => {
        return getPrimaryAddress(person);
      }
    },
    nearbyEvents: {
      type: new GraphQLList(GraphQLEvent),
      args: {
        within: { type: GraphQLInt },
        type: { type: GraphQLString }
      },
      resolve: async (person, {within, type}) => {
        let address = await knex('bsd_addresses').where({
            is_primary: true,
            cons_id: person.cons_id
          }).first()
        let boundingDistance = within / 69
        let eventTypes = null;
        if (type) {
          eventTypes = knex('bsd_event_types')
            .where(name, 'ilike', `%${type}%`)
            .select('event_type_id')
        }

        let query = knex('bsd_events')
          .whereBetween('latitude', [address.latitude - boundingDistance, address.latitude + boundingDistance])
          .whereBetween('longitude', [address.longitude - boundingDistance, address.longitude + boundingDistance])
          .andWhere('start_dt', '>', new Date())

        if (eventTypes)
          query = query.whereIn('event_type_id', [eventTypes])

        return query;
      }
    }
  }),
  interfaces: [nodeInterface]
})

const GraphQLEventType = new GraphQLObjectType({
  name: 'EventType',
  description: 'An event type',
  fields: () => ({
    id: globalIdField('EventType'),
    name: { type: GraphQLString },
    description: { type: GraphQLString }
  })
})

const GraphQLEventAttendee = new GraphQLObjectType({
  name: 'EventAttendee',
  description: 'An event attendee',
  fields: () => ({
    id: globalIdField('EventAttendee'),
  }),
  interfaces: [nodeInterface]
})

let {
  connectionType: GraphQLEventTypeConnection,
} = connectionDefinitions({
  name: 'EventType',
  nodeType: GraphQLEventType
});

const GraphQLEvent = new GraphQLObjectType({
  name: 'Event',
  description: 'An event',
  fields: () => ({
    id: globalIdField('Event'),
    eventIdObfuscated: {
      type: GraphQLString,
      resolve: (event) => event.event_id_obfuscated
    },
    host: {
      type: GraphQLPerson,
      resolve: (event, _, rootValue) => rootValue.dataLoaders.bsdPeople.load(event.creator_cons_id)
    },
    eventType: {
      type: GraphQLEventType,
      resolve: (event, _, rootValue) => rootValue.dataLoaders.bsdEventTypes.load(event.event_type_id)
    },
    flagApproval: {
      type: GraphQLBoolean,
      resolve: (event) => event.flag_approval
    },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    venueName: {
      type: GraphQLString,
      resolve: (event) => event.venue_name
    },
    venueZip: {
      type: GraphQLString,
      resolve: (event) => event.venue_zip
    },
    venueCity: {
      type: GraphQLString,
      resolve: (event) => event.venue_city
    },
    venueState: {
      type: GraphQLString,
      resolve: (event) => event.venue_state_cd
    },
    venueAddr1: {
      type: GraphQLString,
      resolve: (event) => event.venue_addr1
    },
    venueAddr2: {
      type: GraphQLString,
      resolve: (event) => event.venue_addr2
    },
    venueCountry: {
      type: GraphQLString,
      resolve: (event) => event.venue_country
    },
    venueDirections: {
      type: GraphQLString,
      resolve: (event) => event.venue_directions
    },
    localTimezone: {
      type: GraphQLString,
      resolve: (event) => event.start_tz
    },
    localUTCOffset: {
      type: GraphQLString,
      resolve: (event) => {
        return moment().tz(event.start_tz).format('Z');
      }
    },
    startDate: {
      type: GraphQLString,
      resolve: (event) => {
        return moment(event.startDate).format()
      }
    },
    duration: { type: GraphQLInt },
    capacity: { type: GraphQLInt },
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
    attendeeVolunteerShow: {
      type: GraphQLBoolean,
      resolve: (event) => event.attendee_volunteer_show
    },
    attendeeVolunteerMessage: {
      type: GraphQLString,
      resolve: (event) => event.attendee_volunteer_message
    },
    isSearchable: {
      type: GraphQLInt,
      resolve: (event) => event.is_searchable
    },
    publicPhone: {
      type: GraphQLBoolean,
      resolve: (event) => event.public_phone
    },
    contactPhone: {
      type: GraphQLString,
      resolve: (event) => event.contact_phone
    },
    hostReceiveRsvpEmails: {
      type: GraphQLBoolean,
      resolve: (event) => event.host_receive_rsvp_emails
    },
    rsvpUseReminderEmail: {
      type: GraphQLBoolean,
      resolve: (event) => event.rsvp_user_reminder_email
    },
    rsvpReminderHours: {
      type: GraphQLInt,
      resolve: (event) => event.rsvp_email_reminder_hours
    },
    attendeesCount: {
      type: GraphQLInt,
      resolve: async(event) => {
        return knex('bsd_event_attendees').count(1).where('event_id', event.id)
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
      resolve: (assignment, _, rootValue) => rootValue.dataLoaders.gcBsdSurveys.load(assignment.survey_id)
    },
    callsMade: {
      type: GraphQLInt,
      resolve: (callAssignment) => {
        return knex('bsd_calls').count(1).where('call_assignment_id', callAssignment.id)
      }
    },
    query: {
      type: GraphQLString,
      resolve: async (assignment, _, rootValue) => {
        let group = await rootValue.dataLoaders.gcBsdGroups.load(assignment.interviewee_group_id)
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
      resolve: async (survey, _, rootValue) => {
        let underlyingSurvey = await rootValue.dataLoaders.bsdSurveys.load(survey.signup_form_id)
        let slug = underlyingSurvey.slug;
        return url.resolve('https://' + process.env.BSD_HOST, '/page/s/' + slug)
      }
    },
    renderer: { type: GraphQLString }
  }),
  interfaces: [nodeInterface]
})

const GraphQLDeleteEvents = mutationWithClientMutationId({
  name: 'DeleteEvents',
  inputFields: {
    ids: { type: new GraphQLNonNull(new GraphQLList(GraphQLString)) }
  },
  outputFields: {
    listContainer: {
      type: GraphQLListContainer,
      resolve: () => SharedListContainer
    }
  },
  mutateAndGetPayload: async ({ids}, {rootValue}) => {
    adminRequired(rootValue);
    let localIds = ids.map((id) => fromGlobalId(id).id)
    await BSDClient.deleteEvents(localIds);
    await knex('bsd_events').where(id, localId).del()
    return localIds
  }
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
    return knex.transaction(async (trx) => {
      // To ensure that the assigned call exists
      let assignedCall = await knex('bsd_assigned_calls')
        .transacting(trx)
        .where('caller_id', caller.id)
        .first()

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

      let callAssignment = await knex('bsd_call_assignments')
        .transacting(trx)
        .where('id', localCallAssignmentId)
      let survey = await knex('gc_bsd_surveys')
        .transacting(trx)
        .where('id', callAssignment.survey_id)

      let fieldValues = JSON.parse(surveyFieldValues)
      fieldValues['person'] = await knex('bsd_people')
        .transacting(trx)
        .where('id', localIntervieweeId)

      if (completed) {
        if (survey.processors.length === 0)
          return;
        if (!fieldValues['event_id'])
          return;
        let person = fieldValues['person']
        let email = await getPrimaryEmail(person).transacting(trx);
        let address = await getPrimaryAddress(person).transacting(trx);
        let zip = address.zip
        await BSDClient.addRSVPToEvent(email, zip, surveyFields['event_id']);
      }

      let promises = [
        knex('bsd_assigned_calls')
          .transacting(trx)
          .where('id', assignedCall.id)
          .del(),
        knex('bsd_calls')
          .transacting(trx)
          .insert({
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
    adminRequired(rootValue);
    let groupText = intervieweeGroup;
    let group = null;
    let survey = null;
    return knex.transaction(async (trx) => {
      let underlyingSurvey = await knex('bsd_surveys')
        .transacting(trx)
        .where('signup_form_id', surveyId)
        .first()

      if (!underlyingSurvey) {
        try {
          let BSDSurveyResponse = await BSDClient.getForm(surveyId);
          underlyingSurvey = await knex('bsd_surveys')
            .transacting(trx)
            .insert(BSDSurveyResponse)
            .returning('*')
            .first()
        } catch (err) {
          if (err && err.response && err.response.statusCode === 409)
            throw new GraphQLError({
              status: 400,
              message: 'Provided survey ID does not exist in BSD.'
            });
          else
            throw err;
        }
      }

      survey = await knex('gc_bsd_surveys')
        .transacting(trx)
        .insert({
          signup_form_id: surveyId,
          renderer: renderer,
          processors: processors
        })

      if (/^\d+$/.test(groupText)) {
        let underlyingGroup = await knex('bsd_groups')
          .transacting(trx)
          .where('cons_group_id', groupText)
          .first()

        if (!underlyingGroup) {
          try {
            let BSDGroupResponse = await BSDClient.getConstituentGroup(groupText);
            underlyingGroup = await knex('bsd_groups')
              .transacting(trx)
              .insert(BSDGroupResponse)
              .returning('*')
              .first()
          } catch (err) {
            if (err && err.response && err.response.statusCode === 409)
              throw new GraphQLError({
                status: 400,
                message: 'Provided group ID does not exist in BSD.'
              });
            else
              throw err;
          }
        }

        let consGroupID = parseInt(groupText, 10);
        group = await knex('gc_bsd_groups')
          .transacting(trx)
          .where('cons_group_id', consGroupID)
          .first()

        if (!group)
          group = await knex('gc_bsd_groups')
            .transacting(trx)
            .where('cons_group_id', consGroupID)
            .returning('*')
            .first()
      }
      else {
        let query = groupText;
        query = query.toLowerCase().trim().replace(/;*$/, '');

        if (query.indexOf('drop') !== -1)
          throw new GraphQLError({
            status: 400,
            message: 'Cannot use DROP in your SQL'
          })

        if (query !== EVERYONE_GROUP) {
          let limitedQuery = `${query} order by cons_id limit 1 offset 0`
          try {
            await knex.raw(limitedQuery)
          } catch (ex) {
            let error = `Invalid SQL query: ${ex.message}`
            throw new GraphQLError({
              status: 400,
              message: error
            })
          }
        }

        group = await knex('gc_bsd_groups')
          .transacting(trx)
          .where('query', query)
          .first()

        if (!group)
          group = await knex('gc_bsd_groups')
            .transacting(trx)
            .insert({
              query: query
            })
            .returning('*')
            .first()
      }

      return knex('bsd_call_assignments')
        .transacting(trx)
        .insert({
          name: name,
          gc_bsd_group_id: group.id,
          gc_bsd_survey_id: survey.id
        })
        .returning('*')
        .first()
    })
  }
});

let RootMutation = new GraphQLObjectType({
  name: 'RootMutation',
  fields: () => ({
    submitCallSurvey: GraphQLSubmitCallSurvey,
    createCallAssignment: GraphQLCreateCallAssignment,
    deleteEvents: GraphQLDeleteEvents,
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
      resolve: async (parent, _, {rootValue}) => {
        authRequired(rootValue)
        rootValue.user;
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