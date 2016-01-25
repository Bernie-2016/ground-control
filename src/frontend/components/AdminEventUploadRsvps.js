import React from 'react'
import Dropzone from 'react-dropzone';
import {BernieText, BernieColors} from './styles/bernie-css'
import Papa from 'papaparse'
import qs from 'querystring'
import superagent from 'superagent'

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
      textAlign: 'center'
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
      fontSize: '1em',
      textAlign: 'left',
      paddingLeft: 20
    }
  }

  state = {
    filesProcessed: {},
  }

  createRSVPs(data, fileName) {
    if (data.length === 0)
      return;

    let row = data[0]
    delete row['firstname']
    delete row['lastname']
    let url = `/events/add-rsvp?${qs.stringify(row)}`

    superagent.get(url, (err, res) => {
      let filesProcessed = this.state.filesProcessed
      let processObj = filesProcessed[fileName]
      processObj.processedRows += 1

      if (err) {
        processObj.errors.push(err)
      }
      filesProcessed[fileName] = processObj
      this.setState(filesProcessed)
      this.createRSVPs(data.slice(1), fileName)
    })
  }

  onDrop = (files) => {
    files.forEach((file) => {
      let reader = new FileReader();
      reader.onload = (e) => {
        let text = reader.result;
        let data = Papa.parse(text, {header: true}).data
        let processObj = {
          totalRows: data.length,
          processedRows: 0,
          errors: []
        }
        let currentFiles = this.state.filesProcessed
        currentFiles[file.name] = processObj
        this.setState({filesProcessed: currentFiles})
        this.createRSVPs(data, file.name)
      }
      reader.readAsText(file, 'utf8');
    })
  }

  renderFileProgress() {
    let count = 0
    let fileNodes = Object.keys(this.state.filesProcessed).map((fileName) => {
      count = count + 1
      let fileObj = this.state.filesProcessed[fileName]
      let color = fileObj.totalRows === fileObj.processedRows ? (fileObj.errors.length === 0 ? BernieColors.green : BernieColors.red) : BernieColors.gray
      return (
        <div style={{
          ...this.styles.fileStatus,
          color: color,
          backgroundColor: count % 2 ? BernieColors.lightGray : BernieColors.white
        }}>
          {fileName}: {fileObj.processedRows}/{fileObj.totalRows}
        </div>
      )
    })
    return (
      <div style={{marginTop: 20}}>
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
          rejectStyle={this.styles.dropzoneRejectStyle}>
          <div style={{
            paddingTop: 20,
            paddingBottom: 20,
            borderBottom: '1px dashed ' + BernieColors.green
          }}>Drop your CSVs of RSVPs here!</div>
          {this.renderFileProgress()}
        </Dropzone>
      </div>
    );
  }
}