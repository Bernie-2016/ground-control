import React from 'react';
import Relay from 'react-relay';
import SideBarLayout from './SideBarLayout.js'
import GCTextField from './forms/GCTextField.js'
import GCSelectField from './forms/GCSelectField.js'
import moment from 'moment'
import {Paper} from 'material-ui'
import {BernieText} from './styles/bernie-css'

class EventCreate extends React.Component {
  styles = {
    formField: {
      width: 350,
      margin: 0,
      padding: 0
    }
  }
  state = {
    showState: 'DEFAULT',
    formValues: {
      eventTypeId: null,
      hostEmail: null,
      hostName: null,
      contactPhone: null,
      publicPhone: false,
      name: null,
      description: null,
      isSearchable: true,
      isOfficial: false,
      startDates: [],
      startTime: {hour: 6, minute: 30},
      repeat: 'Never',
      localTimezone: null,
      duration: 3,
      venueAddress: null,
      venueCity: null,
      venueState: null,
      venueZip: null,
      venueName: null,
      capacity: 0
    }
  }

  eventTypeChoices() {
    return {
      31: 'This is a test',
      1: 'What',
      4: 'Test'
    }
  }

  renderDefault() {
    return (
      <div style={BernieText.default}>
        <p>
          Groups and individuals are organizing all over the country. Post your event here to get it onto <a href="http://map.berniesanders.com">the map</a>. If you need any help, e-mail <a href="help@berniesanders.com">help@berniesanders.com</a> for additional support.
        </p>
      </div>
    )
  }

  renderWhat() {
    return (
      <div>
        hi
      </div>
    )
  }

  render() {
    let sideBar = (
      <div>
        <GCSelectField
          label="What"
          value={this.state.formValues.eventTypeId}
          style={this.styles.formField}
          onFocus={() => this.setState({showState: 'WHAT'})}
          choices={this.eventTypeChoices()}
        />
        <GCTextField
          label="Who"
          style={this.styles.formField}
          value={this.state.formValues.hostEmail}
        />
        <GCTextField
          label="Where"
          style={this.styles.formField}
          value={this.state.formValues.hostAddress}
        />
      </div>
    )
    let innerContent = this.renderDefault();
    switch (this.state.showState) {
      case 'DEFAULT':
        innerContent = this.renderDefault()
        break;
      case 'WHAT':
        innerContent = this.renderWhat();
        break;
    }
    let content = (
      <div>
        {innerContent}
      </div>
    )
    return (
      <div>
        <div style={BernieText.title}>
          Create an Event
        </div>
        <SideBarLayout
          containerStyle={{
            border: 0
          }}
          content={content}
          sideBar={sideBar}
          sideBarStyle={{
            width: 400,
            border: 0
          }}
          contentViewStyle={{
            marginLeft: 25
          }}
        />
      </div>
    )
  }
}

export default Relay.createContainer(EventCreate, {
  fragments: {
    currentUser: () => Relay.QL`
      fragment on User {
        email
      }
    `
  }
})