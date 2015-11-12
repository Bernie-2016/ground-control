import React from 'react';
import Relay from 'react-relay';
import Survey from './Survey'

class SurveyViewer extends React.Component {
  render() {
    return (
      <Survey survey={this.props.viewer.survey} />
    )
  }
}

export default Relay.createContainer(SurveyViewer, {
  initialVariables: { id: null},

  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        survey(id:$id)
      }
    `
  }
})