import React from 'react';
import Relay from 'react-relay'
import BSDSurvey from './BSDSurvey'
import {BernieColors, BernieText} from '../styles/bernie-css'
import {GoogleMapLoader, GoogleMap, Marker} from 'react-google-maps';
import {FlatButton, Paper} from 'material-ui';
import moment from 'moment';
import FontIcon from 'material-ui/lib/font-icon';
import SideBarLayout from '../SideBarLayout'
import GCSelectField from '../forms/GCSelectField';


class BSDPhonebankRSVPSurvey extends React.Component {
  static propTypes = {
    onSubmitted : React.PropTypes.func,
    initialValues: React.PropTypes.object,
    survey: React.PropTypes.object
  }

  submit() {
    this.refs.survey.refs.component.submit()
  }

  state = {
    clickedMarker: null,
    selectedEventId: null,
    dateFilter: "upcoming",
    markers: []
  }

  handleMarkerClick(marker) {
    this.setState({clickedMarker: marker})
  }

  selectButton(marker) {
    return (
      <FlatButton label='Select' style={{
        ...BernieText.inputLabel,
        backgroundColor: BernieColors.green,
        marginTop: 10,
      }}
        onTouchTap={(event) => {
          this.setState({
            clickedMarker: null,
            selectedEventId: marker.eventId
          })
          this.refs.survey.refs.component.setFieldValue('event_id', marker.eventId)
        }}
      />
    )
  }

  deselectButton() {
    return (
      <FlatButton
        label="Deselect"
        style={{
          ...BernieText.inputLabel,
          backgroundColor: BernieColors.red,
        }}
        onTouchTap={() => {
          this.setState({
            selectedEventId: null
          })
          this.refs.survey.refs.component.setFieldValue('event_id', '')
        }}
      />
    )
  }

  renderSelectedEvent() {
    if (!this.state.selectedEventId)
      return <div></div>
    let event = this.props.interviewee.nearbyEvents.find((event) => event.eventIdObfuscated === this.state.selectedEventId)
    let content = (
      <div>
        <p>Selected <strong>{event.name}</strong></p>
        <p>on <strong>{moment(event.startDate).utcOffset(event.localUTCOffset).format('MMM D')}</strong>.</p>
      </div>
    )
    let sideBar = (
      <div>
        {this.deselectButton()}
      </div>
    )
    return (
      <Paper zDepth={0} style={{
        padding: '10px 10px 10px 10px',
        marginTop: 10,
        border: 'solid 1px ' + BernieColors.green,
        minHeight: 25
      }}>
        <SideBarLayout
          containerStyle={{
            'border': 'none'
          }}
          sideBar={sideBar}
          content={content}
          contentViewStyle={{
            border: 'none',
            paddingRight: 10
          }}
          sideBarStyle={{
            border: 'none',
            textAlign: 'right',
            marginTop: 'auto',
            marginBottom: 'auto'
          }}
          sideBarPosition='right'
        />
      </Paper>
    )
  }

  renderMarkerDescription(marker) {
    let description = <div></div>
    if (!marker)
      return <div></div>;
    if (marker.key === 'home')
      description = (
        <div>
          <div style={{
            ...BernieText.default,
            fontWeight: 600,
            fontSize: '1.0em'
          }}>
            {`${this.props.interviewee.firstName}'s home`}
          </div>
        </div>
      )
    let button = <div></div>;
    if (marker.key !== 'home') {
      let attendance = marker.attendeesCount
      if (marker.capacity)
        attendance = attendance + '/' + marker.capacity
      description = (
        <div>
          <div style={{
            ...BernieText.secondaryTitle,
            color: BernieColors.gray,
            fontSize: '1.0em'
          }}>
            {moment(marker.startDate).utcOffset(marker.localUTCOffset).format('dddd, MMMM Do — h:mm A')}
          </div>
          <div style={{
            ...BernieText.default,
            fontWeight: 600,
            fontSize: '1.0em'
          }}>
            {marker.name}
          </div>
          <div style={{
            ...BernieText.default,
            fontSize: '1.0em'
          }}>
            <div>{marker.venueName}</div>
            <div>{marker.addr1}</div>
            <div>{marker.addr2}</div>
            <div>Attendance: {attendance}</div>
            <div><a href={marker.link} target="_blank">Direct Link</a></div>
            {this.state.selectedEventId === marker.eventId ? this.deselectButton() : this.selectButton(marker)}
          </div>
        </div>
      )
    }

    return (
      <Paper zDepth={0} style={{
        marginTop: 10,
        padding: '10px 10px 10px 10px',
        border: 'solid 1px ' + BernieColors.lightGray
      }}>
        {description}
      </Paper>
    )
  }

  getEventAddr2(event) {
    let desc = ''
    if (event.venueAddr2)
      desc = desc + ' ' + event.venueAddr2;
    if (event.venueCity)
      desc = desc + ' ' + event.venueCity;
    if (event.venueState)
      desc = desc + ', ' + event.venueState
    return desc.trim();
  }

  renderMap() {
    let center = {
      lat: this.props.interviewee.address.latitude,
      lng: this.props.interviewee.address.longitude
    }
    let homeIcon = {
      path: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
      fillColor: BernieColors.blue,
      fillOpacity: 1.0,
      scale: 1,
      strokeColor: BernieColors.blue,
      strokeWeight: 2
    };
    let markers = [
      {
        position: center,
        key: 'home',
        title: 'home',
        name: 'Interviewee home',
        icon: homeIcon
      }
    ];



    this.props.interviewee.nearbyEvents.forEach((event) => {
      if(this.state.dateFilter != 'upcoming'){
        if(!moment().add(this.state.dateFilter.split('_')[0], 'days').isSame(moment(event.startDate), 'day')){
          return;
        }
      }
      markers.push({
        position: {
          lat: event.latitude,
          lng: event.longitude
        },
        localUTCOffset: event.localUTCOffset,
        key: event.id,
        title: event.name,
        name: event.name,
        startDate: event.startDate,
        venueName: event.venueName,
        addr1: event.venueAddr1,
        addr2: this.getEventAddr2(event),
        eventId: event.eventIdObfuscated,
        capacity: event.capacity,
        attendeesCount: event.attendeesCount,
        link: event.link
      })
    })

    return (
      <div style={{height: '100%', width: '100%'}}>
      <GoogleMapLoader
        containerElement={
          <div
            style={{
              height: '100%',
              width: '100%'
            }}
          />
        }
        googleMapElement={
          <GoogleMap
            ref='map'
            options={{
              scrollwheel: false
            }}
            defaultZoom={9}
            defaultCenter={center}>
            {markers.map((marker, index) => {
              return (
                <Marker
                  {...marker}
                  onClick={this.handleMarkerClick.bind(this, marker)}
                />
              );
            })}
          </GoogleMap>
        }
      />
      </div>
    )
  }

  getDateChoices(){
    let options = {"upcoming": "All Upcoming Events"}
    let WEEKDAY_DATE_FORMAT = 'dddd, MMMM Do';

    // comically large for test purposes
    // 10 or 14 would be well suited for the real world I think.
    for(let dayCount = 0; dayCount < 300; dayCount++){
      let label = '';
      if(dayCount == 0){
        label = 'Today, '
      } else if(dayCount == 1){
        label = 'Tomorrow, '
      }

      let date = moment().add(dayCount, 'days')

      // make sure we have events to accommodate that day.
      this.props.interviewee.nearbyEvents.forEach((event) => {
        if(moment(event.startDate).isSame(date, 'day')){
          options[dayCount + "_days"] = label + date.format(WEEKDAY_DATE_FORMAT)
        }
      })

    }

    return options
  }

  renderDateFilters(){
    let content = (
      <GCSelectField
        choices={ this.getDateChoices() }
        onChange={(value) => {
          this.setState({
            dateFilter: value,
            clickedMarker: null
          });
        }}
        clearable={false}
        value={this.state.dateFilter}
        labelStyle={{
          paddingBottom: 0
        }}
      />
    )

    let sidebar = (
      <div>
        Show:
      </div>
    )
    return (
      <SideBarLayout
        content={content}
        sideBar={sidebar}
        containerStyle={{
          border: 'none',
          paddingTop: 10
        }}
        sideBarStyle={{
          ...BernieText.inputLabel,
          border: 'none',
          width: 50
        }}
        contentViewStyle={{
          border: 'none'
        }}
      />
    )
  }

  render() {
    return (
      <div>
        <div style={{width: '100%', height: 200}}>
          {this.renderMap()}
        </div>
        <div>
          {this.renderDateFilters()}
        </div>
        {this.renderSelectedEvent()}
        {this.renderMarkerDescription(this.state.clickedMarker)}
        <BSDSurvey
          ref='survey'
          survey={this.props.survey}
          interviewee={this.props.interviewee}
          onSubmitted={this.props.onSubmitted}
          onLoaded={() => {
            this.refs.survey.refs.component.hideField('event_id')
          }}
        />
      </div>
    )
  }
}

export default Relay.createContainer(BSDPhonebankRSVPSurvey, {
  initialVariables: {
    type: 'phonebank'
  },
  fragments: {
    survey: () => Relay.QL`
      fragment on Survey {
        ${BSDSurvey.getFragment('survey')}
      }
    `,
    interviewee: () => Relay.QL`
      fragment on Person {
        ${BSDSurvey.getFragment('interviewee')}
        firstName
        email
        address {
          latitude
          longitude
        }
        nearbyEvents(within:20, type:$type) {
          id
          eventIdObfuscated
          name
          startDate
          localTimezone
          localUTCOffset
          venueName
          venueAddr1
          venueAddr2
          venueCity
          venueState
          description
          latitude
          longitude
          capacity
          attendeesCount
          link
        }
      }
    `
  }
})

