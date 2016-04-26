import React from 'react'
import Relay from 'react-relay'
import {BernieColors, BernieText} from './styles/bernie-css'
import {Paper, Styles, FlatButton, LinearProgress, GridList, GridTile} from 'material-ui'
import GCForm from './forms/GCForm'
import Form from 'react-formal'
import EventPreview from './EventPreview'
import Dropzone from 'react-dropzone'
import yup from 'yup'
import moment from 'moment'
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider'
import {BernieTheme} from './styles/bernie-theme'
import stripScripts from '../helpers/stripScripts'
import qs from 'querystring'
import superagent from 'superagent'
import MutationHandler from './MutationHandler'
import SaveEventFile from '../mutations/SaveEventFile'

const momentWithTimezone = (startDate, timeZone) => {
  return moment(startDate).tz(timeZone)
}

const FileDownloadLink = ({url, name, style}) => <a href={url} style={style} target='_blank'>{name}</a>

class EventDataUpload extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      fileType: null,
      filesProcessed: {}
    }

    let fileTypeChoices = {}
    this.props.listContainer.eventFileTypes.forEach((type) => {
      fileTypeChoices[type.slug] = type.name
    })
    this.fileTypeChoices = fileTypeChoices
  }

  styles = {
    detailsContainer: {
      float: 'left',
      marginTop: '1rem',
      padding: 10,
      width: '50%'
    },

    filesContainer: {
      width: '100%',
      marginBottom: '1rem',
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
      marginTop: '1em',
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
    }
  }

  setFilesProcessedState(fileName, updatedFileState) {
    let filesProcessed = this.state.filesProcessed
    const currentFileState = filesProcessed[fileName] || {}
    const futureFileState = { ...currentFileState, ...updatedFileState }

    filesProcessed[fileName] = futureFileState
    this.setState({filesProcessed})
  }

  formSchema = yup.object({
    fileType: yup.string().required()
  })

  onDrop = (files) => {
    files.forEach((file) => {
      const processObj = {
        success: false,
        errors: [],
        preview: file.preview
      }
      this.setFilesProcessedState(file.name, processObj)
      this.getSignedRequest(file)
    })
  }

  getSignedRequest = (file) => {
    const {name, type} = file
    const eventId = this.props.event.eventIdObfuscated

    superagent.get(`/events/${eventId}/upload/get-signed-request?${qs.stringify({name, type, eventId, typeSlug: this.state.fileType})}`)
      .end((err, res) => {
        if (err)
          this.setFilesProcessedState(file.name, {errors: [res.text]})
        else
          this.uploadFile(file, res.body)
      })
  }

  uploadFile(file, signedRequest) {
    const {signedRequestEndpoint, key} = signedRequest
    superagent.put(signedRequestEndpoint)
      .set('x-amz-acl', 'public-read')
      .send(file)
      .end((err, res) => {
        if (err){
          this.setFilesProcessedState(file.name, {errors: [res.text]})
        }
        else {
          this.refs.saveEventFileHandler.send({
            event: this.props.event,
            fileName: file.name,
            fileTypeSlug: this.state.fileType,
            mimeType: file.type,
            key
          })
          this.setFilesProcessedState(file.name, {success: true})
        }
      })
  }

  renderDropZone() {
    if (this.state.fileType !== null){
      return (
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
          {this.renderFileProgress()}
        </Dropzone>
      )
    }
    else
      return <div></div>
  }

  renderFileProgress() {
    let count = 0
    const renderFileLink = (fileObj, fileName) => {
      if (fileObj.success || fileObj.errors)
        return <span>{fileName}</span>
      else 
        return (
          <div>
            {fileName}
            <LinearProgress mode="indeterminate"/>
          </div>
        )
    }
    const renderErrors = (fileObj) => {
      if (fileObj.errors.length === 0)
        return <div></div>
      return (
        <div style={{
          ...BernieText.default,
          borderTop: '1px solid ' + BernieColors.red,
          fontSize: '0.5em',
          width: '100%'
        }}>
          {fileObj.errors.map((error, index) => {
            return (
              <div key={index}>
                <br/>
                {error}
              </div>
            )
          })}
        </div>
      )
    }
    let fileNodes = Object.keys(this.state.filesProcessed).map((fileName, index) => {
      count = count + 1
      let fileObj = this.state.filesProcessed[fileName]
      let color = (fileObj.errors.length === 0 ? (false ? BernieColors.green : BernieColors.gray) : BernieColors.red)

      return (
        <div
          style={{
            ...this.styles.fileStatus,
            color: color,
            backgroundColor: count % 2 ? BernieColors.lightGray : BernieColors.white
          }}
          key={index}
        >
          <div style={{padding: 20}}>
            {renderFileLink(fileObj, fileName)}
            {renderErrors(fileObj)}
          </div>
        </div>
      )
    })
    return (
      <div>
        {fileNodes}
      </div>
    )
  }

  renderFileList(files) {
    return (
      <GridList
        cellHeight={200}
        style={{
          ...BernieText.menuItem,
          lineHeight: '1.6em'
        }}
      >
        {files.map(file => (
          <GridTile
            key={file.id}
            title={<b><FileDownloadLink url={file.url} name={file.name} style={{color: 'white'}} /></b>}
            subtitle={<span>Uploaded {moment.utc(file.modifiedDate).format("MMM Do, h:mm a")}</span>}
          >
            <img src={file.url} />
          </GridTile>
        ))}
      </GridList>
    )
  }

  render() {
    const { event } = this.props
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

            <br /><br />

            <div style={this.styles.filesContainer}>
              {this.renderFileList(event.files)}
            </div>
          </div>

          <div style={this.styles.formContainer}>
            <div style={{padding: 15}}>
              <GCForm
                schema={this.formSchema}
              >
                <h3 style={BernieText.secondaryTitle}>Upload Event Data</h3>
                <Form.Field
                  name='fileType'
                  type='select'
                  label='What are you uploading?'
                  fullWidth={true}
                  choices={this.fileTypeChoices}
                  value={this.state.fileType}
                  onChange={(fileType) => {
                    this.setState({fileType})
                  }}
                />

                {this.renderDropZone()}

              </GCForm>
            </div>
          </div>
          <MutationHandler
            ref='saveEventFileHandler'
            mutationClass={SaveEventFile}
            mutationName='saveEventFile'
            successMessage='File upload complete'
          />
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
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        eventFileTypes {
          slug
          name
        }
      }
    `,
    event: () => Relay.QL`
      fragment on Event {
        ${SaveEventFile.getFragment('event')}
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
        files {
          id
          name
          mimeType
          url
          modifiedDate
        }
      }
    `
  }
})
