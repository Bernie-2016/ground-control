import React from 'react'
import Relay from 'react-relay'
import {SelectField, MenuItem, Dialog, FlatButton, TextField} from 'material-ui'
import MutationHandler from './MutationHandler'
import EmailHostAttendees from '../mutations/EmailHostAttendees'

class SendEventMail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      target: 'HOST',
      replyTo: 'info@berniesanders.com',
      subject: '',
      message: ''
    }
  }

  render() {
    let me = this;
    const standardActions = [
      <FlatButton
        label="Cancel"
        secondary={true}
        onTouchTap={this.props.onRequestClose} 
      />,
      <FlatButton
        label="Send Message"
        primary={true}
        disabled={this.state.subject === '' || this.state.message === ''}
        onTouchTap={() => {
          this.refs.sendEmailHandler.send({
            ids: me.props.event.id,
            replyTo: me.state.replyTo,
            bcc: [me.props.currentUser.email],
            subject: me.state.subject,
            message: me.state.message,
            target: me.state.target
          })
        }}
      />
    ]

    return (
      <Dialog
        title="Send Event Email"
        actions={standardActions}
        open={this.props.open}
        onRequestClose={this.props.onRequestClose}
      >
        <SelectField
          floatingLabelText="Send Email To"
          value={this.state.target}
          onChange={(event, index, value) => {
            this.setState({target: value})
          }}
          floatingLabelStyle={{cursor: 'pointer'}}
        >
          <MenuItem value="HOST" primaryText="Event Host"/>
          <MenuItem value="ATTENDEES" primaryText="Event Attendees" disabled={!(this.props.event && this.props.event.attendeesCount > 0)} />
          <MenuItem value="HOST_AND_ATTENDEES" primaryText="Host and Attendees" disabled={!(this.props.event && this.props.event.attendeesCount > 0)} />
        </SelectField>
        <SelectField
          floatingLabelText="Send Replies To"
          value={this.state.replyTo}
          onChange={(event, index, value) => {
            this.setState({replyTo: value})
          }}
          floatingLabelStyle={{cursor: 'pointer'}}
        >
          <MenuItem value={this.props.currentUser.email} primaryText={this.props.currentUser.email}/>
          <MenuItem value="info@berniesanders.com" primaryText="info@berniesanders.com"/>
        </SelectField>
        <TextField
          floatingLabelText="Subject"
          onChange={(event) => {
            this.setState({subject: event.target.value})
          }}
          fullWidth={true}
        />
        <TextField
          floatingLabelText="Message Content"
          onChange={(event) => {
            this.setState({message: event.target.value});
          }}
          multiLine={true}
          rowsMax={11}
          fullWidth={true}
          inputStyle={{backgroundColor: 'rgb(250,250,250)'}}
          ref="message"
        />
        <MutationHandler
          ref='sendEmailHandler'
          mutationClass={EmailHostAttendees}
          mutationName='emailHostAttendees'
          successMessage='Message Sent.'
        />
      </Dialog>
    )
  }
}

export default Relay.createContainer(SendEventMail, {
  fragments: {
    currentUser: () => Relay.QL`
      fragment on User {
        email
      }
    `
  }
})