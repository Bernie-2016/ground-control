import React from 'react';
import Relay from 'react-relay';
import GCForm from './forms/GCForm';
import Form from 'react-formal';
import yup from 'yup';
import moment from 'moment';
import {Card, CardActions, CardExpandable, CardTitle, CardHeader, CardText, FlatButton, TextField, DropDownMenu, SelectField, DatePicker, TimePicker, Checkbox} from 'material-ui';
import {BernieText, BernieColors} from './styles/bernie-css';
import GCSelectField from './forms/GCSelectField'
import InfoHeader from './InfoHeader'

export default class EventPreview extends React.Component {
  constructor(props) {
    super(props);
    // this.handleKeyDown = this.handleKeyDown.bind(this);
    // document.addEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(event){
    switch(event.keyIdentifier){
      case 'Down':
      case 'Right':
        // View next event
        this.props.onChangeEventIndex(1);
        break;
      case 'Up':
      case 'Left':
        // View previous event
        this.props.onChangeEventIndex(-1);
        break;
      case 'U+0041':
        // 'A' was pressed; approve and move to next event
        this.props.onEventConfirm([this.props.eventIndex]);
        break;
      case 'U+0045':
        // 'E' was pressed; open edit tab
        this.props.onTabRequest(this.props.eventIndex, 1);
        break;
      case 'U+0050':
        // 'P' was pressed; open preview tab
        this.props.onTabRequest(this.props.eventIndex, 0);
        break;
      case 'U+0044':
        // 'D' was pressed; delete this event
        this.props.onEventDelete([this.props.eventIndex]);
        break;
      default:
        //Statements executed when none of the values match the value of the expression
        console.log(event.keyIdentifier);
        break;
    }
  }

  componentWillUnmount(){
    document.removeEventListener('keydown', this.handleKeyDown);
  }


  render() {
    let event = this.props.event
    return (
      <div>
        <CardText>
          <h1 style={BernieText.title}>{event.name}</h1>

          <InfoHeader content='Event Type' />
          <p>{event.eventType.name}</p>

          <InfoHeader content='Event Description' />
          <p>{event.description}</p>

          <InfoHeader content='Event Date & Time' />
          <p>{moment(event.startDate).format('LLLL')} <span style={{color: BernieColors.gray}}>{moment(event.startDate).format('llll')} local time</span></p>
          <p>Duration: {Math.floor(event.duration / 60)} hours {event.duration % 60} minutes</p>

          <InfoHeader content='Event Location' />
          <p>{event.venueName}</p>
          <p>{event.venueAddr1} {event.venueAddr2}</p>
          <p>{event.venueCity} {event.venueState}, {event.venueZip} ({event.venueCountry})</p>
          <br/>
          <p>Capacity: {(event.capacity == 0) ? 'Unlimited' : event.capacity}</p>
          <br/>
          <p>Directions: {(event.venueDirections) ? event.venueDirections : 'None'}</p>
        </CardText>
      </div>
    )
  }
}