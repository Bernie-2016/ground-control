import Relay from 'react-relay';

export default class SaveEventFile extends Relay.Mutation {
  static fragments = {
    listContainer: () => Relay.QL`
    `,
  };

  getMutation() {
    return Relay.QL`
      mutation{ SaveEventFile }
    `;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on SaveEventFilePayload {
      }
    `;
  }

  getConfigs() {
    return [{
    }];
  }

  getVariables() {
    return {
    }
  }
}
