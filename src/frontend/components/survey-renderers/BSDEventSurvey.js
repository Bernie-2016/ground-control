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
    <BSDSurvey
      survey={this.props.survey}
      initialValues={this.props.initialValues}
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
    `
  }
})

