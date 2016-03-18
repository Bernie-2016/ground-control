import React from 'react'
import Relay from 'react-relay'
import {BernieColors, BernieText} from './styles/bernie-css'
import {Paper, Styles, FlatButton} from 'material-ui'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import EventPreview from './EventPreview'
import Dropzone from 'react-dropzone'
import yup from 'yup'
import moment from 'moment'
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider'
import {BernieTheme} from './styles/bernie-theme'
import stripScripts from '../helpers/stripScripts'

const momentWithTimezone = (startDate, timeZone) => {
  return moment(startDate).tz(timeZone)
}

class EventDataUpload extends React.Component {
  styles = {
    detailsContainer: {
      float: 'left',
      marginTop: '1rem',
      padding: 10,
      width: '50%'
    },

    formContainer: {
      float: 'right',
      marginTop: '1rem',
      padding: 10,
      width: '40%'
    },

    pageContainer: {
      margin: '1rem'
    },

    dropzoneStyle: {
      font: BernieText.default,
      fontSize: '1.5em',
      color: BernieColors.green,
      margin: '0 auto',
      width: '100%',
      minHeight: 300,
      borderWidth: 2,
      borderColor: BernieColors.green,
      borderStyle: 'dashed',
      borderRadius: 5,
      position: 'relative',
      textAlign: 'center',
      overflow: 'scroll'
    },

    dropzoneActiveStyle: {
      borderStyle: 'solid',
      backgroundColor: '#eee'
    },

    dropzoneRejectStyle: {
      borderStyle: 'solid',
      backgroundColor: '#ffdddd'
    },

    fileStatus: {
      ...BernieText.secondaryTitle,
      fontSize: '0.75em',
      textAlign: 'left',
      paddingLeft: 20
    }
  }

  formSchema = yup.object({
    notes: yup.string().required(),
  })

  onDrop = (files) => {
    files.forEach((file) => {
      // Upload files
    })
  }

  renderFileProgress() {
    let count = 0
    let renderErrors = (fileObj) => {
      if (fileObj.errors.length === 0)
        return <div></div>
      return (
        <div style={{
          ...BernieText.default,
          borderTop: '1px solid ' + BernieColors.red,
          fontSize: '0.5em',
          paddingLeft: 10,
          width: 470,
        }}>
          {fileObj.errors.map((error) => {
            return (
              <div>
                {`${error.email}, Zip: ${error.zip}, Phone: ${error.phone}`}
                <br />
                <span style={{color: BernieColors.red}}>{error.error}</span>
                <hr />
              </div>
            )
          })}
        </div>
      )
    }
    let fileNodes = Object.keys(this.state.filesProcessed).map((fileName) => {
      count = count + 1
      let fileObj = this.state.filesProcessed[fileName]
      let color = (fileObj.errors.length === 0 ? (fileObj.totalRows === fileObj.processedRows ? BernieColors.green : BernieColors.gray) : BernieColors.red)

      return (
        <div style={{
          ...this.styles.fileStatus,
          color: color,
          backgroundColor: count % 2 ? BernieColors.lightGray : BernieColors.white
        }}>
          {fileName}: {fileObj.processedRows}/{fileObj.totalRows}
          {renderErrors(fileObj)}
        </div>
      )
    })
    return (
      <div>
        {fileNodes}
      </div>
    )
  }

  render() {
    const event = this.props.event
    let formattedDateTime = momentWithTimezone(event.startDate, event.localTimezone)
    formattedDateTime = formattedDateTime ? formattedDateTime.format('LLLL') : event.startDate

    if (!event)
      return <div style={{ textAlign: 'center', margin: '4em'}}>
                <h1 style={BernieText.title}>Invalid Event</h1>
                <p style={BernieText.default}>This event does not exist. If you've just recently created your event.
                this error may resolve itself in a short period of time. It's also
                possible your event was deleted. Please email <a href="mailto:help@berniesanders.com">help@berniesanders.com</a> if you need help.</p>
              </div>

    return (
      <MuiThemeProvider muiTheme={Styles.getMuiTheme(BernieTheme)}>
        <div style={this.styles.pageContainer}>

          <div style={this.styles.detailsContainer}>
            <h1 style={BernieText.title}>{event.name}</h1>
            <h3 style={{...BernieText.secondaryTitle, fontSize: '1.2rem'}}>{formattedDateTime}</h3>
            <p dangerouslySetInnerHTML={stripScripts(event.description)}></p>
          </div>

          <div style={this.styles.formContainer}>
            <div style={{padding: 15}}>
              <GCForm
                schema={this.formSchema}
                defaultValue={{
                  notes: null
                }}
                onSubmit={(formValues) => {
                  this.refs.mutationHandler.send({
                    eventId: this.props.event.id,
                    ...formValues
                  })
                }}
              >
                <h3 style={BernieText.secondaryTitle}>Upload Event Data</h3>
                <Form.Field
                  name='notes'
                  multiLine={true}
                  fullWidth={true}
                  label="Notes"
                />

                <Dropzone
                  ref="dropzone"
                  onDrop={this.onDrop}
                  style={this.styles.dropzoneStyle}
                  activeStyle={this.styles.dropzoneActiveStyle}
                  rejectStyle={this.styles.dropzoneRejectStyle}
                  disableClick={true}
                >
                  <div style={{
                    paddingTop: 20,
                    paddingBottom: 20,
                    borderBottom: '1px dashed ' + BernieColors.green
                  }}>
                    <div style={{...BernieText.title, fontSize: '1.2em', color: BernieColors.green}}>
                      Drop your Event Files here!
                    </div>
                    <div style={{...BernieText.default, fontSize: '0.65em'}}>
                      <FlatButton
                        label="Select Files to Upload"
                        onTouchTap={() => this.refs.dropzone.open()}
                      />
                    </div>
                  </div>
                </Dropzone>

                <br />
                <br />
                <Form.Button type='submit' label='Submit' fullWidth={true} />
              </GCForm>
            </div>
          </div>

        </div>
      </MuiThemeProvider>
    )
  }
}

export default Relay.createContainer(EventDataUpload, {
  fragments: {
    currentUser: () => Relay.QL`
      fragment on User {
        id
        email
      }
    `,
    event: () => Relay.QL`
      fragment on Event {
        attendeesCount
        attendeeVolunteerMessage
        attendeeVolunteerShow
        fastFwdRequest{
          hostMessage
        }
        capacity
        contactPhone
        createDate
        description
        duration
        eventIdObfuscated
        eventType {
          id
          name
        }
        flagApproval
        host {
          id
          firstName
          lastName
          email
        }
        hostReceiveRsvpEmails
        id
        isSearchable
        latitude
        localTimezone
        localUTCOffset
        longitude
        name
        nearbyPeople {
          id
          firstName
          lastName
          email
        }
        publicPhone
        rsvpEmailReminderHours
        rsvpUseReminderEmail
        startDate
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
