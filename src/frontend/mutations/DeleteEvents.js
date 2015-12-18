import Relay from 'react-relay';

export default class DeleteEvents extends Relay.Mutation {
  static fragments = {
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`
      mutation{ deleteEvents }
    `;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on DeleteEventsPayload {
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
      ids: this.props.eventIDs
    }
  }
}
