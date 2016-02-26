import React from 'react';
import Relay from 'react-relay';

export default class SendEventMail extends React.Component {
  constructor(props) {
    super(props);
  }

  handleSubmit() {
    console.log('submitting...')
  }

  render() {
    const standardActions = [
      <FlatButton
        label="Cancel"
        secondary={true}
        onTouchTap={this.props.handleCancel} />,
      <FlatButton
        label={}
        primary={true}
        disabled={}
        onTouchTap={this.handleSubmit}
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
          onChange={(event, index, value) => {
            console.log(value)
          }}
          style={{width: '350px'}}
          floatingLabelStyle={{cursor: 'pointer'}}
          >
            <MenuItem value="host" primaryText="Event Host"/>
            <MenuItem value="attendees" primaryText="Event Attendees"/>
            <MenuItem value="hostAndAttendees" primaryText="Host and Attendees"/>
          </SelectField><br />
          <TextField
          floatingLabelText="Message Content"
          value={}
          onChange={(event) => {
            this.setState({message: event.target.value});
          }}
          multiLine={true}
          rowsMax={11}
          fullWidth={true}
          inputStyle={{backgroundColor: 'rgb(250,250,250)'}}
          ref="message"
          />
      </Dialog>
    )
  }
}
