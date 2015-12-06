import Relay from 'react-relay';

export default class SubmitCallSurvey extends Relay.Mutation {
  static fragments = {
    currentUser: () => Relay.QL`
      fragment on User {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`
      mutation{ submitCallSurvey }
    `;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on SubmitCallSurveyPayload {
        currentUser {
          id,
        },
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        currentUser: this.props.currentUser.id
      }
    }];
  }

  getVariables() {
    return {
      completed: this.props.completed,
      callAssignmentId: this.props.callAssignmentId,
      intervieweeId: this.props.intervieweeId,
      leftVoicemail: this.props.leftVoicemail,
      sentText: this.props.sentText,
      reasonNotCompleted: this.props.reasonNotCompleted,
    }
  }
}
