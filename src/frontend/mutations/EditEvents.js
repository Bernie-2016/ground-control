import Relay from 'react-relay';

export default class EditEvents extends Relay.Mutation {
  static fragments = {
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`
      mutation{ editEvents }
    `;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on EditEventsPayload {
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
      events: this.props.events
    }
  }
}
