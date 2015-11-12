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
  Call,
  Survey,
  GroupCall,
} from './models';

import moment from 'moment-timezone';
import Promise from 'bluebird';
import Maestro from '../maestro';
import thinky from './thinky';
import BSD from '../bsd';
import url from 'url';

class Viewer {
  constructor(identifier) {
    this.id = identifier
  }
}
const SharedViewer = new Viewer(1);

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
    if (type === 'GroupCall')
      return GroupCall.get(id);
    if (type === 'Viewer')
      return SharedViewer;
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
    if (obj instanceof GroupCall)
      return GraphQLGroupCall;
    if (obj instanceof Viewer)
      return GraphQLViewer;
    return null;
  }
);

const GraphQLPerson = new GraphQLObjectType({
  name: 'Person',
  description: 'A person.',
  fields: () => ({
    id: globalIdField('Person'),
  }),
  interfaces: [nodeInterface]
})

let {
  connectionType: GraphQLPersonConnection,
} = connectionDefinitions({
  name: 'Person',
  nodeType: GraphQLPerson
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
      resolve: (assignment) => Survey.get(assignment.surveyId)
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
        if (survey.BSDLink) {
          let bsd = new BSD(process.env.BSD_HOST, process.env.BSD_API_ID, process.env.BSD_API_SECRET);
          let surveyData = await bsd.getForm(survey.BSDLink.id);
          return {
            id: survey.BSDLink.id,
            fullURL: url.resolve('https://' + process.env.BSD_HOST, '/page/s/' + surveyData.api.signup_form.signup_form_slug)
          }
        }
        return null;
      }
    }
  }),
  interfaces: [nodeInterface]
})

const GraphQLGroupCall = new GraphQLObjectType({
  name: 'GroupCall',
  description: 'A group call',
  fields: () => ({
    id: globalIdField('GroupCall'),
    name: { type: GraphQLString },
    scheduledTime: { type: GraphQLInt },
    maxSignups: { type: GraphQLInt }
  }),
  interfaces: [nodeInterface]
});

let {
  connectionType: GraphQLGroupCallConnection,
} = connectionDefinitions({
  name: 'GroupCall',
  nodeType: GraphQLGroupCall
});

const GraphQLCreateCallAssignment = mutationWithClientMutationId({
  name: 'CreateCallAssignment',
  inputFields: () => ({
    name: new GraphQLNonNull(GraphQLString),
    callerGroup: new GraphQLNonNull(GraphQLString),
    targetGroup: new GraphQLNonNull(GraphQLString),
    BSDSurvey: new GraphQLNonNull(GraphQLString),
    startDate: new GraphQLNonNull(GraphQLInt),
    endDate: GraphQLInt
  }),
  outputFields: () => ({
    viewer: {
      type: GraphQLViewer,
      resolve: () => {
        return SharedViewer;
      }
    }
  }),
  mutateAndGetPayload:({name, callerGroup, targetGroup, BSDSurvey, startDate, endDate}) => {
    return CallAssignment.save({
      name: name,
      callerGroupId: callerGroup,
      targetGroupId: targetGroup,
      surveyId: BSDSurvey,
      startDate: startDate,
      endDate: endDate
    })
  }
});

const GraphQLGroupCallInput = new GraphQLInputObjectType({
  name: 'GroupCallInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    scheduledTime: { type: new GraphQLNonNull(GraphQLInt) },
    maxSignups: { type: new GraphQLNonNull(GraphQLInt) },
    duration: { type: new GraphQLNonNull(GraphQLInt) }
  }
})

const GraphQLBatchCreateGroupCall = mutationWithClientMutationId({
  name: 'BatchCreateGroupCall',
  inputFields: () => ({
    groupCallList: { type: new GraphQLNonNull(new GraphQLList(GraphQLGroupCallInput)) }
  }),
  outputFields: () => ({
    viewer: {
      type: GraphQLViewer,
      resolve: () => {
        return SharedViewer;
      }
    }
  }),
  mutateAndGetPayload:async ({groupCallList}) => {
    let promises = [];
    let maestro = new Maestro(process.env.MAESTRO_UID, process.env.MAESTRO_TOKEN, process.env.MAESTRO_URL, process.env.DEBUG);

    for (let index = 0; index < groupCallList.length; index++) {
      let groupCall = groupCallList[index];
      let response = await maestro.createConferenceCall(groupCall.name, groupCall.maxSignups, moment(groupCall.scheduledTime).tz('America/Los_Angeles').format('YYYY.MM.DD HH:mm:ss'), groupCall.duration)

      promises.push(GroupCall.save({
        name: groupCall.name,
        scheduledTime: groupCall.scheduledTime,
        maxSignups: groupCall.maxSignups,
        duration: groupCall.duration,
        maestroConferenceUID: response.value.UID,
        signups: []
      }));
    };

    await Promise.all(promises);
    return {};
  }
});

const GraphQLViewer = new GraphQLObjectType({
  name: 'Viewer',
  fields: () => ({
    id: globalIdField('Viewer'),
    groupCallList: {
      type: GraphQLGroupCallConnection,
      args: {
       upcoming: {
          type: GraphQLBoolean,
          defaultValue: null
        },
        ...connectionArgs,
      },
      resolve: async (viewer, {first, upcoming}) => {
        let r = thinky.r;
        let queryFilter = {};
        if (upcoming)
          queryFilter = (row) => row('scheduledTime').gt(new Date());
        else if (upcoming == false)
          queryFilter = (row) => row('scheduledTime').le(new Date());

        let calls = await r.table(GroupCall.getTableName())
          .orderBy('scheduledTime')
          .filter(queryFilter)
          .limit(first)

        return connectionFromArray(calls, {first});
      }
    },
    groupCall: {
      type: GraphQLGroupCall,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (viewer, {id}) => {
        let localId = fromGlobalId(id).id;
        return GroupCall.get(localId);
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
    callAssignment: {
      type: GraphQLCallAssignment,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (viewer, {id}) => {
        let localId = fromGlobalId(id).id;
        return CallAssignment.get(localId);
      }
    },
    survey: {
      type: GraphQLSurvey,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (viewer, {id}) => {
        let localId = fromGlobalId(id).id
        return Survey.get(localId)
      }
    },
  }),
  interfaces: [nodeInterface]
})

let RootMutation = new GraphQLObjectType({
  name: 'RootMutation',
  fields: () => ({
    batchCreateGroupCall: GraphQLBatchCreateGroupCall
  })
});

let RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => ({
    viewer: {
      type: GraphQLViewer,
      resolve: () => SharedViewer
    },
    node: nodeField
  }),
});

export let Schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation
});