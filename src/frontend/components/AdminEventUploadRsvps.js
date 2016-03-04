import React from 'react'
import Dropzone from 'react-dropzone';
import {BernieText, BernieColors} from './styles/bernie-css'
import {RaisedButton} from 'material-ui'
import Papa from 'papaparse'
import qs from 'querystring'
import superagent from 'superagent'
import downloadCSV from '../helpers/downloadCSV'

export default class AdminEventUploadRsvps extends React.Component {
  styles = {
    dropzoneStyle: {
      font: BernieText.default,
      fontSize: '1.5em',
      color: BernieColors.green,
      margin: '0 auto',
      width: 500,
      height: 500,
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

  state = {
    filesProcessed: {},
  }

  allowedKeys = new Set([
    'event_id',
    'event_id_obfuscated',
    'will_attend',
    'guid',
    'email',
    'zip',
    'country',
    'shift_ids',
    'phone',
    'employer',
    'occupation',
    'addr1',
    'addr2',
    'addr3',
    'city',
    'comment',
    // 'firstname', // not sure why first and last name don't work, but they're also not immediately necessary
    'guests',
    'is_potential_volunteer',
    'is_reminder_sent',
    // 'lastname',
    'pledge_amt',
    'pledge_method',
    'state_cd',
    'zip_4'
  ])

  createRSVPs(row, fileName, [...eventIdKeys]) {
    const obfuscatedIds = eventIdKeys
      .filter((key) => row[key])
      .map((key) => row[key])

    row.event_id_obfuscated = [row.event_id_obfuscated, ...obfuscatedIds].join(',')

    Object.keys(row).forEach((key) => {
      if (!this.allowedKeys.has(key))
        delete row[key]
    })
    let url = `/events/add-rsvp?${qs.stringify(row)}`

    superagent.post(url, (err, res) => {
      let filesProcessed = this.state.filesProcessed
      let processObj = filesProcessed[fileName]
      processObj.processedRows += 1

      console.log(res.body)

      if (err) {
        processObj.errors.push(res.body)
      }
      filesProcessed[fileName] = processObj
      this.setState(filesProcessed)
    })
  }

  onDrop = (files) => {
    let eventIdKeys
    const transformFields = (chunk) => {
      eventIdKeys = new Set(chunk.match(/(Event\s\d+\sID)/g))

      return chunk
        .replace(/Email Address/i, 'email')
        .replace(/First Name/i, 'firstname')
        .replace(/Last Name/i, 'lastname')
        .replace(/Phone Number/i, 'phone')
        .replace(/Zip/i, 'zip')
        .replace(/DWID/i, 'guid')
    }

    files.forEach((file) => {
      let reader = new FileReader();
      reader.onload = (e) => {
        let text = reader.result;
        let data = Papa.parse(text, {header: true, beforeFirstChunk: transformFields}).data
        let processObj = {
          totalRows: data.length,
          processedRows: 0,
          errors: []
        }
        let currentFiles = this.state.filesProcessed
        currentFiles[file.name] = processObj
        this.setState({filesProcessed: currentFiles})

        for (let i=0; i<data.length; i++){
          this.createRSVPs(data[i], file.name, eventIdKeys)
        }
      }
      reader.readAsText(file, 'utf8');
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
    let renderDownloadErrors = (fileObj, fileName) => {
      if (fileObj.errors.length === 0)
        return <div></div>
      return (
        <RaisedButton
          label="Download & Fix Errors"
          primary={true}
          style={{marginTop: '1em', marginBottom: '1em'}}
          onTouchTap={() => {
            const csv = Papa.unparse(fileObj.errors)  

            // modify file name to include 'errors'
            fileName = fileName.split('.')
            const fileExtension = fileName[fileName.length - 1]
            fileName[fileName.length - 1] = 'errors'
            fileName.push(fileExtension)  

            // download the file
            downloadCSV(csv, fileName.join('.'))
          }}
        />
      )
    }
    let fileNodes = Object.keys(this.state.filesProcessed).map((fileName) => {
      count = count + 1
      let fileObj = this.state.filesProcessed[fileName]
      let color = (fileObj.errors.length === 0 ? (fileObj.totalRows === fileObj.processedRows ? BernieColors.green : BernieColors.gray) : BernieColors.red)

      return (
        <div>
          <div style={{
            ...this.styles.fileStatus,
            color: color,
            backgroundColor: count % 2 ? BernieColors.lightGray : BernieColors.white
          }}>
            {fileName}: {fileObj.processedRows}/{fileObj.totalRows}
            {renderErrors(fileObj)}
          </div>
          {renderDownloadErrors(fileObj, fileName)}
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
    return (
      <div style={{paddingTop: 40}}>
        <Dropzone
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
              Drop your CSVs of RSVPs here!
            </div>
            <div style={{...BernieText.default, fontSize: '0.65em'}}>
              CSV with column headers - any of the values under "Query Parameters" <a href="https://www.bluestatedigital.com/page/api/doc#----------------------graph-addrsvp-----------------" target="_blank">here</a>.
            </div>
          </div>
          {this.renderFileProgress()}
        </Dropzone>
      </div>
    );
  }
}