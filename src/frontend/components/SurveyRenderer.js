import React from 'react';
import Relay from 'react-relay';
import BSDSurvey from './survey-renderers/BSDSurvey'
import BSDPhonebankRSVPSurvey from './survey-renderers/BSDPhonebankRSVPSurvey'

class SurveyRenderer extends React.Component {
  static propTypes = {
    onSubmitted : React.PropTypes.func,
  }

  renderers = {
    'BSDSurvey': BSDSurvey,
    'BSDPhonebankRSVPSurvey': BSDPhonebankRSVPSurvey
  }

  submit() {
    this.refs.survey.refs.component.submit()
  }

  render() {
    let Survey = this.renderers[this.props.survey.renderer];
    return (
      <Survey
        survey={this.props.survey}
        interviewee={this.props.interviewee}
        currentUser={this.props.currentUser}
        ref='survey'
        onSubmitted={this.props.onSubmitted}
      />
    )
  }
}

// As far as I know, there is no dynamic way to generate relay fragments, so we just need to add them here when we have new survey renderers
export default Relay.createContainer(SurveyRenderer, {
  fragments: {
    survey: () => Relay.QL`
      fragment on Survey {
        renderer
        ${BSDSurvey.getFragment('survey')}
      }
    `,
    interviewee: () => Relay.QL`
      fragment on Person {
        ${BSDSurvey.getFragment('interviewee')}
        ${BSDPhonebankRSVPSurvey.getFragment('interviewee')}
      }
    `,
    currentUser: () => Relay.QL`
      fragment on User {
        ${BSDPhonebankRSVPSurvey.getFragment('currentUser')}
        ${BSDSurvey.getFragment('currentUser')}
      }
    `
  }
})