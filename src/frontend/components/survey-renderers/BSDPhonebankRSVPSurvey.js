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
    if (this.checkForm())
      this.props.onSubmitted({
        event_id: this.state.selectedEventId,
        join_call_team: this.state.joinCallTeam
      })
  }

  // This is hacky, but using a GCForm or React Formal inside this survey seems to not work
  checkForm() {
    let errors = {}
    if (this.state.signupQuestion === null)
      errors['signupQuestion'] = 'This field is required'
    if (this.state.joinCallTeam === null)
      errors['joinCallTeam'] = 'This field is required'

    this.setState({errors: errors});
    if (Object.keys(errors).length === 0)
      return true;

    return false
  }

  state = {
    clickedMarker: null,
    selectedEventId: null,
    signupQuestion: null,
    joinCallTeam: null,
    dateFilter: "upcoming",
    errors: {}
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

  selectDefaultMarker(dateFilter) {
    let markers = this.markers(dateFilter)
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

  componentWillMount() {
    this.selectDefaultMarker()
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
            selectedEventId: marker.eventId,
            signupQuestion: true
          })
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
        Selected <strong>{event.name}</strong> on <strong>{this.momentWithOffset(event.startDate, event.localUTCOffset).format('MMM D')}</strong>.
      </div>
    )
    // We will eventually factor out the map into its own form component that can be controlled via value. If it is uncontrolled, it can show select and deselect buttons.  Otherwise it will just be selected/deselected via the parent
    /*    let sideBar = (
          <div>
            {this.deselectButton()}
          </div>
        )
    */
    let sideBar = <div></div>
    return (
      <Paper zDepth={0} style={{
        padding: '10px 10px 10px 10px',
        marginTop: 0,
        backgroundColor: BernieColors.lightBlue,
        border: 'solid 1px ' + BernieColors.blue,
        minHeight: 25
      }}>
        {content}
      </Paper>
    )
  }

  renderMarkerDescription(marker) {
    let description = <div></div>
    if (!marker)
      return <div></div>;
    let borderColor = this.state.selectedEventId === marker.eventId ? BernieColors.blue : BernieColors.green
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
            {this.state.selectedEventId === marker.eventId ? '' : this.selectButton(marker)}
          </div>
        </div>
      )
    }

    return (
      <Paper zDepth={0} style={{
        marginTop: 0,
        padding: '10px 10px 10px 10px',
        border: 'solid 1px ' + borderColor
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

  markers(dateFilter) {
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

    let filter = dateFilter || this.state.dateFilter

    this.props.interviewee.nearbyEvents.forEach((event) => {
      if(filter != 'upcoming') {
        if(!moment().utcOffset(event.localUTCOffset).add(filter.split('_')[0], 'days').isSame(this.momentWithOffset(event.startDate, event.localUTCOffset), 'day')) {
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
      if (this.state.selectedEventId && marker.eventId === this.state.selectedEventId) {
        marker.icon = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|147FD7'
      }
      else if (this.state.clickedMarker && marker.eventId === this.state.clickedMarker.eventId) {
        // FIXME - the hex code is BernieColors.green hardcoded
        marker.icon = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|4acc66'
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
    for(let dayCount = 0; dayCount < 300; dayCount++) {
      let label = '';
      if(dayCount == 0){
        label = 'Today, '
      } else if(dayCount == 1){
        label = 'Tomorrow, '
      }

      // make sure we have events to accommodate that day.
      this.props.interviewee.nearbyEvents.forEach((event) => {
        let date = moment().utcOffset(event.localUTCOffset).add(dayCount, 'days')
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
            dateFilter: value
          })
          this.selectDefaultMarker(value)
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

  renderAdditionalEvents() {
    let eventCount = this.props.interviewee.nearbyEvents.length - 1;
    let text = <span></span>
    if (eventCount > 0) {
      text = (
        <span>There {eventCount > 1 ? 'are' : 'is'} also <strong>{eventCount-1}</strong> other phone bank{eventCount > 1 ? 's' : ''} being held near you over the next month if that date doesn't work. <strong>[Click the event date filter below to find a date that works for them and click on a pin on the map to get its description]</strong>.
        </span>
      )
    }
    return text
  }

  renderScriptAfterQuestion(yes, no, questionValue) {
    let both = (
      <div>
        <div><strong>[If yes]</strong> {yes}</div>
        <div style={this.styles.paragraph}><strong>[If no]</strong> {no}</div>
      </div>
    )
    return (
      <div style={{marginTop: 20}}>
        {questionValue === true ? yes : (questionValue === false) ? no : both}
      </div>
    )
  }

  render() {
    let signupYesText = <div>Great! I've signed you up and you should be receiving an e-mail with all the details soon!</div>
    let signupNoText = <div>That's ok.  If you change your mind, you can always head to <strong>map.berniesanders.com</strong> to sign up.  And if you are interested, sign up to host a phone bank there and we'll make sure people in your area find out about it!</div>
    let callTeamYesText = <div>Thanks! You should get an e-mail shortly with information in it about how to get involved.</div>
    let callTeamNoText = <div>No worries. I understand that calling isn't everyone's thing. You can still get involved in other ways if you let us know at <strong>berniesanders.com/volunteer</strong>.</div>
    return (
      <div style={BernieText.default}>
        <div style={{marginBottom: 0}}>
          <div style={{
            ...BernieText.title,
            fontSize: '1.4em',
            color: BernieColors.lightBlue
          }}>
          Call Script
          </div>
          <div>Hi <strong>{this.props.interviewee.firstName || ''}</strong>, my name is {this.props.currentUser.firstName || '_______'} and I'm a volunteer with the Bernie Sanders campaign. I'm calling you because you signed up at some point to help out with the Bernie Sanders campaign.  Right now, we are trying to get as many volunteers as possible to show up to phone bank parties that other volunteers are hosting.  These phone banks are events where volunteers get together to contact voters in the early states.  It's an incredibly crucial part of our strategy to get Senator Sanders elected as president because we've seen that when volunteers talk to voters, Bernie starts doing better.
          </div>
          <div style={this.styles.paragraph}>
          I see that there is a phone bank being held near you on <strong>{this.state.clickedMarker ? this.momentWithOffset(this.state.clickedMarker.startDate, this.state.clickedMarker.localUTCOffset).format(WEEKDAY_DATE_FORMAT) : '[event date]'}</strong> at <strong>{this.state.clickedMarker ? this.state.clickedMarker.addr1 : '[event address]'}</strong>.  {this.renderAdditionalEvents()}
          </div>
          <GCBooleanField
            errorText={this.state.errors.signupQuestion}
            label="Can I sign you up for this phone bank party?"
            labelStyle={this.styles.question}
            value={this.state.signupQuestion}
            onChange={(value) => {
              let selectedEventId = null
              if (this.state.clickedMarker === null)
                log.error(`No clicked marker when selecting event -- Interviewee: ${this.props.interviewee.email}: Nearby events count: ${this.props.interviewee.nearbyEvents.length}`)
              else
                selectedEventId = value ? this.state.clickedMarker.eventId : null

              this.setState({
                signupQuestion: value,
                selectedEventId: selectedEventId
              })
            }}
          />
        </div>
        <div style={{marginBottom: 5, marginTop: 20}}>
          {this.renderDateFilters()}
        </div>
        {this.renderSelectedEvent()}
        <div style={{width: '100%', height: 300}}>
          {this.renderMap()}
        </div>
        {this.renderMarkerDescription(this.state.clickedMarker)}
        <div>
          {this.renderScriptAfterQuestion(signupYesText, signupNoText, this.state.signupQuestion)}
          <div style={this.styles.paragraph}>
            One last thing: we need more people to make calls like the one I'm making. You can do these from home and you'll be talking to other volunteers who have agreed to be contacted.
          </div>
          <div style={{marginBottom: 15}}>
            <GCBooleanField
              errorText={this.state.errors.joinCallTeam}
              label="Can we send you some information about joining our calling team?"
              labelStyle={this.styles.question}
              value={this.state.joinCallTeam}
              onChange={(value) => this.setState({joinCallTeam: value})}
            />
          </div>
          <div>
            {this.renderScriptAfterQuestion(callTeamYesText, callTeamNoText, this.state.joinCallTeam)}
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

