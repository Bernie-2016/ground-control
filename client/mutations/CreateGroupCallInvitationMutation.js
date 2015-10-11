class CreateGroupCallInvitationMutation extends Relay.Mutation {
  static fragments = {
    story: () => Relay.QL`
      fragment on Story { id }
    `,
  };
  getMutation() {
    return Relay.QL`
      mutation{ createGroupCallInvitation }
    `;
  }
  getFatQuery() {
    return Relay.QL`
      fragment on CreateCommentPayload {
        story { comments },
      }
    `;
  }
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: { story: this.props.story.id },
    }];
  }
  getVariables() {
    return { text: this.props.text };
  }
}