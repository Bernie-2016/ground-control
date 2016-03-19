import React from 'react'
import Relay from 'react-relay'
import {SelectField, MenuItem, Dialog, FlatButton, TextField} from 'material-ui'
import MutationHandler from './MutationHandler'
import EmailHostAttendees from '../mutations/EmailHostAttendees'
import linkedState from 'react-link';
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
            ids: this.props.event.id,
            replyTo: this.state.replyTo,
            bcc: [this.props.currentUser.email],
            subject: this.state.subject,
            message: this.state.message,
            target: this.state.target
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
          floatingLabelStyle={{cursor: 'pointer'}}
        >
          <MenuItem value={this.props.currentUser.email} primaryText={this.props.currentUser.email}/>
          <MenuItem value="info@berniesanders.com" primaryText="info@berniesanders.com"/>
        </SelectField>
        <TextField
          valueLink={linkedState(this, 'subject')}
          floatingLabelText="Subject"
          fullWidth={true}
        />
        <TextField
          valueLink={linkedState(this, 'message')}
          floatingLabelText="Message Content"
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