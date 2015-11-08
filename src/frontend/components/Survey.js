import React from 'react';
import Relay from 'react-relay';

class Survey extends React.Component {
  styles = {
    frame: {
      display: 'block',
      border: 'none',
      width: '100%',
      height: '100%',
    },
    container: {
      width: '100%',
      height: '800px',
    }
  }

  render() {
    return (
      <div style={this.styles.container}>
        <iframe scrolling="no" src={this.props.viewer.survey.BSDData.fullURL} style={this.styles.frame} />
      </div>
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