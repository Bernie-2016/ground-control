import Relay from 'react-relay'

export default class SaveEventFile extends Relay.Mutation {
  static fragments = {
    event: () => Relay.QL`
      fragment on Event {
        id,
        eventIdObfuscated
        files
      }
    `
  }

  getMutation() {
    return Relay.QL`
      mutation{ saveEventFile }
    `
  }

  getFatQuery() {
    console.log(this.props.event)
    return Relay.QL`
      fragment on SaveEventFilePayload {
        event {
          id
          files
        },
      }
    `
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        event: this.props.event.id
      }
    }]
  }

  getVariables() {
    const { fileName, fileTypeSlug, mimeType, key } = this.props
    return {
      sourceEventId: this.props.event.eventIdObfuscated,
      fileName,
      fileTypeSlug,
      mimeType,
      key
    }
  }
}
