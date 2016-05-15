import React from 'react'
import Relay from 'react-relay'
import {BernieColors, BernieText} from './styles/bernie-css'
import {Paper, Slider, Toggle, Styles} from 'material-ui'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import EventPreview from './EventPreview'
import EventInvalid from './EventInvalid'
import MutationHandler from './MutationHandler'
import CreateFastFwdRequest from '../mutations/CreateFastFwdRequest'
import yup from 'yup'
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider'
import {BernieTheme} from './styles/bernie-theme'

const publicEventsRootUrl = 'https://secure.berniesanders.com/page/event/detail/'

require('./styles/fastFwdForm.css')

class FastFwdForm extends React.Component {
  styles = {
    detailsContainer: {
      float: 'left',
      paddingBottom: '1em',
      paddingRight: '1em'
    },

    formContainer: {
      float: 'left',
      padding: '1em',
      marginBottom: '2em',
      border: 'solid 1px ' + BernieColors.lightGray
    },

    pageContainer: {
      margin: '0 auto',
      padding: '2em',
    }
  }

  state = {
    testMode: false,
    recipientLimit: null
  }

  render() {

    if (!this.props.event)
      return <EventInvalid />


    let event_type_name = 'volunteer event'

    if(this.props.event.eventType.name.toLowerCase().indexOf('phone bank') > -1){
      event_type_name = 'phone bank party'
    }

    if(this.props.event.eventType.name.toLowerCase().indexOf('barnstorm') > -1){
      event_type_name = 'Barnstorm event'
    }

    let defaultHostMessage = this.props.event.fastFwdRequest ? this.props.event.fastFwdRequest.hostMessage :
                            "Hello, neighbors!\n\nI'm hosting a " + event_type_name +
                            " and I need a few more Bernie supporters " +
                            "to attend to make this event a big success. " +
                            "Will you please attend my event?\n\n" +
                            publicEventsRootUrl + this.props.event.eventIdObfuscated + "\n\n" +
                            "Thank you,\n\n" +
                            (this.props.event.host ? this.props.event.host.firstName: "")

    let formSchema = yup.object({
      hostMessage: yup.string().default(this.props.event.hostMessage || defaultHostMessage).required(),
    })

    return (
      <MuiThemeProvider muiTheme={Styles.getMuiTheme(BernieTheme)}>
        <div style={this.styles.pageContainer} className="ffwdPageContainer">
          <MutationHandler ref='mutationHandler'
                           successMessage='Your request has been saved. We will review it and send it out to volunteers in your area ASAP!'
                           mutationClass={CreateFastFwdRequest}
                           mutationName='createFastFwdRequest'
                           onSuccess={() => {
                              setTimeout(() => {
                                this.props.history.push('/events')
                              }, 5000)
                         }} />
          <h1 style={BernieText.title}>
            Fast Fwd: Send a message to bring volunteers to your event
          </h1>

          <div zDepth={1} style={this.styles.detailsContainer} className="ffwdDetailsContainer">
            <h3 style={{...BernieText.secondaryTitle, fontSize: '1.2rem'}}>Your Event Details:</h3>
            <EventPreview event={this.props.event} />
          </div>

          <Paper style={this.styles.formContainer} className="ffwdFormContainer">
            <GCForm
              schema={formSchema}
              defaultValue={formSchema.default()}
              value = {this.state.model}
              onChange={ model => {
                this.setState({ model })
              }}
              onSubmit={(formValues) => {
                this.refs.mutationHandler.send({
                  eventId: this.props.event.id,
                  ...formValues
                })
              }}
            >
              <p style={BernieText.inputLabel}>Author a message below about your event and why people should come out.
                We'll forward it on to potential attendees in your area.</p>
              <Form.Field
                name='hostMessage'
                multiLine={true}
                fullWidth={true}
                label="Message From Host"
              />
              <br />
              <br />
              <Form.Button type='submit' label='Submit' fullWidth={true} />
            </GCForm>
          </Paper>
        </div>
      </MuiThemeProvider>
    )
  }
}

export default Relay.createContainer(FastFwdForm, {
  fragments: {
    currentUser: () => Relay.QL`
      fragment on User {
        id
        email
      }
    `,
    event: () => Relay.QL`
      fragment on Event {
        id
        fastFwdRequest{
          hostMessage
        }
        attendeesCount
        isOfficial
        capacity
        description
        duration
        eventIdObfuscated
        eventType {
          name
        }
        host {
          firstName
          lastName
          email
        }
        name
        startDate
        localTimezone
        venueAddr1
        venueAddr2
        venueCity
        venueCountry
        venueDirections
        venueName
        venueState
        venueZip
      }
    `
  }
})
