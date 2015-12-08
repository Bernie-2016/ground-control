import React from 'react';
import Relay from 'react-relay'
import BSDSurvey from './BSDSurvey'

class BSDEventSurvey extends React.Component {
  static propTypes = {
    onSubmitted : React.PropTypes.func,
    initialValues: React.PropTypes.object,
    survey: React.PropTypes.object
  }

  static defaultProps = {
    onSubmitted : () => { }
  }

  render() {
    return <BSDSurvey
      survey={this.props.survey}
      interviewee={this.props.interviewee}
      onSubmitted={this.props.onSubmitted}
    />
  }
}

export default Relay.createContainer(BSDEventSurvey, {
  fragments: {
    survey: () => Relay.QL`
      fragment on Survey {
        ${BSDSurvey.getFragment('survey')}
      }
    `,
    interviewee: () => Relay.QL`
      fragment on Person {
        ${BSDSurvey.getFragment('interviewee')}
        nearbyEvents(within:20) {
          name
          latitude
          longitude
        }
      }
    `
  }
})

