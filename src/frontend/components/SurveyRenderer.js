import React from 'react';
import Relay from 'react-relay';


class SurveyRenderer extends React.Component {
  static propTypes = {
    onSubmitted : React.PropTypes.func,
  }

  renderers = {
    'BSDSurvey': BSDSurvey,
    'PhonebankRSVPSurvey': PhonebankRSVPSurvey,
    'SingleEventRSVPSurvey': SingleEventRSVPSurvey
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
        ${PhonebankRSVPSurvey.getFragment('interviewee')}
        ${SingleEventRSVPSurvey.getFragment('interviewee')}
      }
    `,
    currentUser: () => Relay.QL`
      fragment on User {
        ${PhonebankRSVPSurvey.getFragment('currentUser')}
        ${BSDSurvey.getFragment('currentUser')}
        ${SingleEventRSVPSurvey.getFragment('currentUser')}
      }
    `
  }
})