import Relay from 'react-relay';

export default class ReviewEvents extends Relay.Mutation {
  static fragments = {
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`
      mutation{ reviewEvents }
    `;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on ReviewEventsPayload {
        listContainer {
          id,
          events
        },
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        listContainer: this.props.listContainer.id
      }
    }];
  }

  getVariables() {
    return {
      ids: this.props.eventIDs,
      pendingReview: this.props.pendingReview
    }
  }
}
