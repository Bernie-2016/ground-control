import React from 'react';
import Relay from 'react-relay';
import BSDSurvey from './survey-renderers/BSDSurvey'
import BSDPhonebankRSVPSurey from './survey-renderers/BSDPhonebankRSVPSurey'

class SurveyRenderer extends React.Component {
  static propTypes = {
    onSubmitted : React.PropTypes.func,
  }

  submit() {
    this.refs.survey.refs.component.submit()
  }

  render() {
    let Survey = this.props.survey.renderer;
    return (
      <Survey
        survey={this.props.survey}
        interviewee={this.props.interviewee}
        ref='survey'
        onSubmitted={this.props.onSubmitted}
      />
    )
  }
}

// As far as I know, there is no dynamic way to generate relay fragments, so we just need to add them here when we have new survey renderers
export default Relay.createContainer(BSDSurveyRenderer, {
  fragments: {
    survey: () => Relay.QL`
      fragment on Survey {
        renderer
        ${BSDSurvey.getFragment('survey')}
        ${BSDPhonebankRSVPSurey.getFragment('survey')}
      }
    `,
    interviewee: () => Relay.QL`
      fragment on Person {
        ${BSDSurvey.getFragment('interviewee')}
        ${BSDPhonebankRSVPSurey.getFragment('interviewee')}
      }
    `
  }
})