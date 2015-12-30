import React from 'react';
import Relay from 'react-relay'
import {BernieColors, BernieText} from '../styles/bernie-css'
import Form from 'react-formal'
import {GoogleMapLoader, GoogleMap, Marker} from 'react-google-maps';
import {FlatButton, Paper} from 'material-ui';
import moment from 'moment';
import FontIcon from 'material-ui/lib/font-icon';
import SideBarLayout from '../SideBarLayout'
import GCSelectField from '../forms/GCSelectField';
import GCBooleanField from '../forms/GCBooleanField';

const WEEKDAY_DATE_FORMAT = 'dddd, MMMM Do';
class BSDPhonebankRSVPSurvey extends React.Component {
  static propTypes = {
    onSubmitted : React.PropTypes.func,
    initialValues: React.PropTypes.object,
    survey: React.PropTypes.object
  }

  submit() {

//    this.refs.survey.refs.component.submit()
  }

  state = {
    clickedMarker: null,
    selectedEventId: null,
    joinCallTeam: null,
    signupQuestion1: null,
    signupQuestion2: null,
    dateFilter: "upcoming"
  }

  styles = {
    question: {
      ...BernieText.secondaryTitle,
      fontWeight: 600,
      marginTop: 20,
      color: BernieColors.blue,
      fontSize: '1em',
      letterSpacing: '0em'
    },
    paragraph: {
      marginTop: 10
    }
  }

  componentWillMount() {
    let markers = this.markers()
    markers.sort((marker1, marker2) => {
      if (marker1.key === 'home')
        return 1
      else if (marker2.key === 'home')
        return -1
      return marker1.startDate - marker2.startDate
    })
    if (markers[0] && markers[0].key !== 'home')
      this.setState({clickedMarker: markers[0]})
  }

  momentWithOffset(startDate, utcOffset) {
    startDate = startDate * 1000
    return moment(startDate).utcOffset(utcOffset)
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
        <p>on <strong>{this.momentWithOffset(event.startDate, event.localUTCOffset).format('MMM D')}</strong>.</p>
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
        backgroundColor: BernieColors.lightBlue,
        border: 'solid 1px ' + BernieColors.blue,
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
            {this.
              momentWithOffset(marker.startDate, marker.localUTCOffset).format('dddd, MMMM Do — h:mm A')}
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
            <div><a href={marker.link} target="_blank">{marker.venueName}</a></div>
            <div>{marker.addr1}</div>
            <div>{marker.addr2}</div>
            <div>Attendance: {attendance}</div>
            {this.state.selectedEventId === marker.eventId ? this.deselectButton() : this.selectButton(marker)}
          </div>
        </div>
      )
    }

    return (
      <Paper zDepth={0} style={{
        marginTop: 10,
        padding: '10px 10px 10px 10px',
        border: 'solid 1px ' + BernieColors.green
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

  markers() {
    let center = this.intervieweeHomeCoords();
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
        if(!moment().add(this.state.dateFilter.split('_')[0], 'days').isSame(this.momentWithOffset(event.startDate, event.localUTCOffset), 'day')){
          return;
        }
      }
      let marker = {
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
        link: event.link,
        icon: null
      }
      if (this.state.clickedMarker && marker.eventId === this.state.clickedMarker.eventId) {
        // FIXME - the hex code is BernieColors.green hardcoded
        marker.icon = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|4acc66'
      }
      else if (this.state.selectedEventId && marker.eventId === this.state.selectedEventId) {
        marker.icon = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|147FD7'
      }
      markers.push(marker)
    })
    return markers
  }

  intervieweeHomeCoords() {
    return {
      lat: this.props.interviewee.address.latitude,
      lng: this.props.interviewee.address.longitude
    }
  }

  renderMap() {
    let markers = this.markers();
    let center = this.intervieweeHomeCoords();

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
        if(this.momentWithOffset(event.startDate, event.localUTCOffset).isSame(date, 'day')){
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
      <div style={{
        ...BernieText.inputLabel,
        fontWeight: '600'
      }}>
        Show events on date:
      </div>
    )
    return (
      <SideBarLayout
        content={content}
        sideBar={sidebar}
        containerStyle={{
          border: 'none'
        }}
        sideBarStyle={{
          ...BernieText.inputLabel,
          border: 'none',
          width: 200
        }}
        contentViewStyle={{
          border: 'none'
        }}
      />
    )
  }

  renderNo() {
    let eventCount = this.props.interviewee.nearbyEvents.length;
    let text = <div></div>
    if (eventCount >= 2) {
      text = (
        <div>
          <p>That's ok - is there a day that you are free to go to a phone bank party? There are <strong>{eventCount}</strong> upcoming phone banks in your area. <strong>[Click the event date filter above to find a date that works for them and click on a pin on the map to get its description]</strong>.
          </p>
          <GCBooleanField
            label="Can I sign you up for this other phone bank party?"
            labelStyle={this.styles.question}
            value={this.state.signupQuestion2}
            onChange={(value) => this.setState({signupQuestion2: value})}
          />
        </div>
      )
    }
    else
      text = (
        <div>
          <span>That's ok.  There's no other phone banks in your area upcoming, but check out https://map.berniesanders.com.  And if you are interested, sign up to host a phone bank there and we'll make sure people in your area find out about it!
          </span>
        </div>
      )
    return text
  }

  renderResultFromQuestion2() {
    if (this.state.signupQuestion2 === null)
      return <div></div>
    return (
      <div>
      {this.state.signupQuestion2 === false ? "No worries - thanks for taking the time to hear me out." : "Great! I've signed you up, and you should be receiving an e-mail with all the details soon!"}
      </div>
    )
  }

  renderResultFromQuestion1() {
    let yes = <div>Great! I've signed you up and you should be receiving an e-mail with all the details soon!</div>
    let no = this.renderNo();
    let result = (
      <div>
        <div style={{marginTop: 20}}>
          <strong>[If yes, click 'Select' on the phone bank above]</strong> {yes}
        </div>
        <div style={this.styles.paragraph}>
          <strong>[If no]</strong> {no}
        </div>
      </div>
    )
    if (this.state.signupQuestion1 === true)
      return (
        <div style={{marginTop: 20}}>
          <strong>[Click 'Select' on the phone bank above]</strong>
          {yes}
        </div>
      )

    else if (this.state.signupQuestion1 === false)
      return (
        <div style={this.styles.paragraph}>
          {no}
          {this.renderResultFromQuestion2()}
        </div>
      )
    return result;
  }

  render() {
    return (
      <div style={BernieText.default}>
        <div style={{marginBottom: 0}}>
          <p>Hi <strong>{this.props.interviewee.firstName || ''}</strong>, my name is {this.props.currentUser.firstName || '_______'} and I'm a volunteer with the Bernie Sanders campaign. I'm calling you because you signed up at some point to help out with the Bernie Sanders campaign.  Right now, we are trying to get as many volunteers as possible to show up to phone bank parties that other volunteers are hosting.  These phone banks are events where volunteers get together to contact voters in the early states.  It's an incredibly crucial part of our strategy to get Senator Sanders elected as president because we've seen that when volunteers talk to voters, Bernie starts doing better.
          </p>
          <p style={this.styles.paragraph}>
          I see that there is a phone bank being held near you on <strong>{this.state.clickedMarker ? this.momentWithOffset(this.state.clickedMarker.startDate, this.state.clickedMarker.localUTCOffset).format(WEEKDAY_DATE_FORMAT) : '[event date]'}</strong> at <strong>{this.state.clickedMarker ? this.state.clickedMarker.addr1 : '[event address]'}</strong>.
          </p>
          <GCBooleanField
            label="Can I sign you up for this phone bank party?"
            labelStyle={this.styles.question}
            value={this.state.signupQuestion1}
            onChange={(value) => this.setState({signupQuestion1: value})}
          />
        </div>
        <div style={{marginBottom: 5}}>
          {this.renderDateFilters()}
        </div>
        <div style={{width: '100%', height: 300}}>
          {this.renderMap()}
        </div>
        {this.renderSelectedEvent()}
        {this.renderMarkerDescription(this.state.clickedMarker)}
        <div>
          {this.renderResultFromQuestion1()}
          <p style={this.styles.paragraph}>
            One last thing: we need more people to make calls like the one I'm making. You can do these from home and you'll be talking to other volunteers who have agreed to be contacted.
          </p>
          <p style={this.styles.question}>

          </p>
          <div style={{marginBottom: 15}}>
            <GCBooleanField
              label="Can we send you some information about joining our calling team?"
              labelStyle={this.styles.question}
              value={this.state.joinCallTeam}
              onChange={(value) => this.setState({joinCallTeam: value})}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default Relay.createContainer(BSDPhonebankRSVPSurvey, {
  initialVariables: {
    type: 'phonebank'
  },
  fragments: {
    currentUser: () => Relay.QL`
      fragment on User {
        firstName
      }
    `,
    interviewee: () => Relay.QL`
      fragment on Person {
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

