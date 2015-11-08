import React from 'react';
import Relay from 'react-relay';
import Radium from 'radium';
import Frame from './Frame';

@Radium
class Survey extends React.Component {
  frameMessageHandler = (message) => {
    console.log(message)
  }

  render() {
    return (
      <Frame source={this.props.viewer.survey.BSDData.fullURL} onMessage={this.frameMessageHandler} />
    )
  }
}

export default Relay.createContainer(Survey, {
  initialVariables: {
    id: null
  },
  prepareVariables: (prev) =>
  {
    return {id: prev.id}
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        survey(id:$id) {
          BSDData {
            fullURL
          }
        }
      }
    `
  }
})