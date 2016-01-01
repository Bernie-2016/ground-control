import React from 'react'
import Relay from 'react-relay'
import {BernieColors, BernieText} from './styles/bernie-css'
import {Paper} from 'material-ui'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import MutationHandler from './MutationHandler'
import CreateEventEmail from '../mutations/CreateEventEmail'
import yup from 'yup'

class AdminEventEmailCreationForm extends React.Component {
  styles = {
    formContainer: {
      width: 380,
      paddingLeft: 15,
      paddingRight: 15,
      paddingTop: 15,
      paddingBottom: 15,
      marginTop: 15,
      border: 'solid 1px ' + BernieColors.lightGray
    }
  }

  formSchema = yup.object({
    hostEmail: yup.string().email().required(),
    senderEmail: yup.string().email().required(),
    hostMessage: yup.string().required(),
    senderMessage: yup.string().required()
  })

  render() {
    return (
      <div>
        <MutationHandler ref='mutationHandler'
                         successMessage='Event email sent!'
                         mutationClass={CreateEventEmail} />
        <div style={BernieText.title}>
          Send Event Email
        </div>
        <p>
          Email nearby potential attendees, encouraging them to come out.
        </p>
        <br />
        <div>
          <h3>Event Details</h3>
          <dl>
            <dt>Name</dt>
            <dd>{this.props.event.name}</dd>

            <dt>Description</dt>
            <dd>{this.props.event.description}</dd>

            <dt>Venue</dt>
            <dd>
              {this.props.event.venueName}<br />
              {this.props.event.venueCity}, {this.props.event.venueState}
            </dd>
          </dl>
        </div>
        <Paper zDepth={1} style={this.styles.formContainer}>
          <GCForm
            schema={this.formSchema}
            defaultValue={{
              hostEmail: this.props.event.host.email
            }}
            onSubmit={(formValue) => {
              this.refs.mutationHandler.send({
                listContainer: this.props.listContainer,
                ...formValue
              })
            }}
          >
            <Form.Field
              name='hostEmail'
              label="Host Email Address"
            />
            <br />
            <Form.Field
              name='senderEmail'
              label="Sender Email Address"
            />
            <Form.Field
              name='hostMessage'
              multiLine={true}
              rows={5}
              label="Message From Host"
            />
            <br />
            <Form.Field
              name='senderMessage'
              multiLine={true}
              rows={5}
              label="Message From Sender"
            />
            <br />
            <br />
            <Form.Button type='submit' label='Send!' fullWidth={true} />
          </GCForm>
        </Paper>
      </div>
    )
  }
}

export default Relay.createContainer(AdminEventEmailCreationForm, {
  fragments: {
    event: () => Relay.QL`
      fragment on Event {
        id
        name
        description
        venueName
        venueCity
        venueState
        host {
          email
        }
      }
    `
  }
})
