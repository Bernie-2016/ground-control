import React from 'react'
import Relay from 'react-relay'
import {BernieText, BernieColors} from './styles/bernie-css'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import GCTextField from './forms/GCTextField'
import yup from 'yup'

class RequestEmailForm extends React.Component {

  styles = {
    container: {
      marginLeft: 40,
      marginTop: 40
    }
  };

  state = {
    hostMessage: ''
  }

  render() {
    return (
      <div style={this.styles.container}>
        <div style={BernieText.title}>
          Request an email to recruit local volunteers to you phone bank
        </div>
        <div style={BernieText.default}>
          <strong>The best way to get volunteers to your phonebank is with a direct personal ask from the host -- that's you!</strong>
        </div>
        <div style={{
          ...BernieText.default,
          marginTop: 10
        }}>
          Just let us know what message we should forward to potential volunteers on your behalf, and we will send an e-mail to Bernie volunteers in your area to let them know about your phonebank event.
        </div>
        <GCTextField
          name='message'
          multiLine={true}
          rows={3}
          style={{
            width: 800
          }}
          value={this.state.hostMessage}
          onChange={(val) => this.setState({hostMessage: val})}
          label="What message should we forward to potential volunteers on your behalf?"
        />
      </div>
    )
  }
}

export default Relay.createContainer(RequestEmailForm, {
  fragments: {
    event: () => Relay.QL`
      fragment on Event {
        name
      }
    `
  }
})