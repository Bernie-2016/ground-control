import React from 'react'
import ReactDOM from 'react-dom'
import Relay from 'react-relay'
import EventPreview from './EventPreview'
import EventEdit from './EventEdit'
import SendEventMail from './SendEventMail'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle, SelectField, DropDownMenu, DropDownIcon, Dialog, Tabs, Tab, FlatButton, RaisedButton, IconButton, FontIcon, Checkbox, TextField} from 'material-ui'
import {Table, Column, ColumnGroup, Cell} from 'fixed-data-table'
import {BernieText, BernieColors} from './styles/bernie-css'
import moment from 'moment'
import json2csv from 'json2csv'
import qs from 'qs'
import superagent from 'superagent'
import Papa from 'papaparse'
import downloadCSV from '../helpers/downloadCSV'
import flattenJSON from '../helpers/flattenJSON'
import {states} from './data/states'
import {USTimeZones} from './data/USTimeZones'

import IconMenu from 'material-ui/lib/menus/icon-menu'
import MenuItem from 'material-ui/lib/menus/menu-item'
import MutationHandler from './MutationHandler'
import DeleteEvents from '../mutations/DeleteEvents'
import EditEvents from '../mutations/EditEvents'
import ReviewEvents from '../mutations/ReviewEvents'

require('fixed-data-table/dist/fixed-data-table.min.css')
require('./styles/adminEventsSection.css')

const publicEventsRootUrl = 'https://secure.berniesanders.com/page/event/detail/'

const plurry = (n) => (Math.abs(n) == 1) ? '' : 's';

const convertType = (value) => {
  if (typeof value === 'object'){
    let updatedValue = {}
    Object.keys(value).forEach((key) => {
      const currentValue = convertType(value[key])
      if (currentValue != undefined)
        value[key] = currentValue
    })
    return value
  }
  else if (value === 'none')
    return null
  else if (value === 'true')
    return true
  else if (value === 'false')
    return false
  else if (value != '' && !isNaN(value) && String(Number(value)) === value)
    return Number(value)
  else if (value)
    return String(value)
  else {
    return undefined
  }
}

const keyboardActionStyles = {
  text: {fontSize: '0.9em', top: '-7px', color: BernieColors.gray, cursor: 'default'},
  icon: {cursor: 'default'}
}

const KeyboardActionsInfo = () => (
  <div style={{float:'left',position:'relative',top:'-6px'}}>
    <IconButton tooltip="Close" style={keyboardActionStyles.text}>esc</IconButton>
    <IconButton tooltip="Approve" style={keyboardActionStyles.text}>a</IconButton>
    <IconButton tooltip="Preview" style={keyboardActionStyles.text}>p</IconButton>
    <IconButton tooltip="Edit" style={keyboardActionStyles.text}>e</IconButton>
    <IconButton tooltip="Delete" style={{fontSize: '0.9em',top:'-7px',color:BernieColors.gray,cursor:'default'}} >d</IconButton>
    <IconButton iconClassName="material-icons" style={keyboardActionStyles.icon} iconStyle={{color:BernieColors.gray}} tooltip="Previous Event">keyboard_arrow_up</IconButton>
    <IconButton iconClassName="material-icons" style={keyboardActionStyles.icon} iconStyle={{color:BernieColors.gray}} tooltip="Next Event">keyboard_arrow_down</IconButton>
  </div>
)

const approvalFilterOptions = {
  PENDING_APPROVAL: {
    text: 'Pending Approval',
    actions: ['delete', 'approve', 'edit', 'email']
  },
  PENDING_REVIEW: {
    text: 'Pending Review',
    actions: ['delete', 'demote', 'approve', 'edit', 'email']
  },
  APPROVED: {
    text: 'Public Events',
    actions: ['delete', 'demote', 'edit', 'email', 'call', 'fastForward', 'downloadRSVPs']
  },
  FAST_FWD_REQUEST: {
    text: 'FastFwd Requests',
    actions: ['fastForward']
  }
}

let availableActions = []
let events = []

class AdminEventsSection extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showDeleteEventDialog: false,
      showEventPreview: false,
      showCreateEventDialog: false,
      showFiltersDialog: false,
      showSendEventEmailDialog: false,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      actionsCount: 5,
      selectedRows: [],
      indexesMarkedForDeletion: [],
      activeEventIndex: null,
      activeEvent: null,
      previewTabIndex: 0,
      userMessage: '',
      deletionConfirmationMessage: null,
      deletionReasonIndex: null,
      loading: false,
      undoAction: function(){console.log('undo')}
    }

    window.addEventListener('resize', this._handleResize)
  }

  _handleResize = (e) => {
    this.setState({
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    })
  }

  HeaderCell = ({content, ...props}) => (
    <Cell {...props}
    style={{
      fontFamily: 'Roboto',
      fontSize: '14px',
      fontWeight: 400,
      color: '#9e9e9e'
    }}
    >
      {content}
    </Cell>
  )

  SortControllerCell = ({content, attribute, ...props}) => (
    <Cell {...props}
    onClick={(event) => {
      let sortDir = 'ASC'
      let columnWasAlreadySelected = (this.props.relay.variables.sortField == attribute)

      if (columnWasAlreadySelected && this.props.relay.variables.sortDirection == 'ASC') {
        sortDir = 'DESC'
      }

      this._handleQueryChange({
        sortField: attribute,
        sortDirection: sortDir
      })

      this.setState({selectedRows: []})
    }}
    style={{
      fontFamily: 'Roboto',
      fontSize: '14px',
      fontWeight: 400,
      color: '#9e9e9e',
      cursor: 'pointer'
    }}
    >
      {content}{(this.props.relay.variables.sortField == attribute) ? <FontIcon
      className="material-icons"
      style={{display: 'inline', float: 'right', position: 'relative', top: '-3px'}}
      >{(this.props.relay.variables.sortDirection == 'ASC') ? 'arrow_drop_up' : 'arrow_drop_down'}</FontIcon> : ''}
    </Cell>
  )

  SelectCell = ({rowIndex, data, col, selectedRows, ...props}) => (
    <Cell {...props}>
      <Checkbox
        name="checkboxName1"
        value="checkboxValue1"
        checked={selectedRows.indexOf(rowIndex) > -1}
        eventIndex={rowIndex}
        onCheck={() => {
          this._handleEventSelect(rowIndex);
        }}
        style={{marginLeft: '15px'}}
      />
    </Cell>
  )

  TextCell = ({rowIndex, data, col, ...props}) => (
    <Cell {...props}
    style={{
      fontFamily: 'Roboto',
      fontSize: '13px',
      lineHeight: '18px'
    }}
    >
      {data[rowIndex]['node'][col]}
    </Cell>
  )

  BooleanCell = ({rowIndex, data, col, ...props}) => (
    <Cell {...props}
    style={{
      fontFamily: 'Roboto',
      fontSize: '13px',
      lineHeight: '18px'
    }}
    >
      {(data[rowIndex]['node'][col]) ? 'true' : 'false'}
    </Cell>
  )

  NoHTMLCell = ({rowIndex, data, col, ...props}) => {
    let displayString = data[rowIndex]['node'][col];
    return (
      <Cell {...props}
      style={{
        fontFamily: 'Roboto',
        fontSize: '13px',
        lineHeight: '18px'
      }}
      >
        <div dangerouslySetInnerHTML={{__html: displayString.replace(/(<([^>]+)>)|\\n/ig, "")}}/>
      </Cell>
    )
  }

  HostInfoCell = ({rowIndex, data, col, info, ...props}) => {
    let cellData = data[rowIndex] && data[rowIndex]['node'] && data[rowIndex]['node'][col] ? data[rowIndex]['node'][col][info] : ''
    if (info === 'email') {
      let link = `mailto:${cellData}`
      cellData = <a href={link}>{cellData}</a>
    }
    else if (info === 'name') {
      cellData = data[rowIndex] && data[rowIndex]['node'] && data[rowIndex]['node'][col] ? data[rowIndex]['node'][col]['firstName'] + ' ' + data[rowIndex]['node'][col]['lastName'] : ''
    }
    return (
      <Cell {...props}
      style={{
        fontFamily: 'Roboto',
        fontSize: '13px',
        lineHeight: '18px'
      }}
      >
        {cellData}
      </Cell>
    )
  }

  EventTypeCell = ({rowIndex, data, col, attr, ...props}) => (
    <Cell {...props}
    style={{
      fontFamily: 'Roboto',
      fontSize: '13px',
      lineHeight: '18px'
    }}
    >
      {data[rowIndex]['node'] && data[rowIndex]['node'][col] ? data[rowIndex]['node'][col][attr] : ''}
    </Cell>
  )

  DateCell = ({rowIndex, data, col, ...props}) => {
    let utcOffset = col === 'startDate' ? data[rowIndex]['node']['localUTCOffset'] : 0
    let timezone = col === 'startDate' ? data[rowIndex]['node']['localTimezone'] : 'UTC'
    let offsetDate = moment(data[rowIndex]['node'][col]).utcOffset(utcOffset)
    let formattedDate = offsetDate.format('l LT')

    return (
      <Cell {...props}
      style={{
        fontFamily: 'Roboto',
        fontSize: '13px',
        lineHeight: '18px'
      }}
      >
        {formattedDate}<br/>
        {timezone}
      </Cell>
    )
  }

  DurationCell = ({rowIndex, data, col, ...props}) => (
    <Cell {...props}
    style={{
      fontFamily: 'Roboto',
      fontSize: '13px',
      lineHeight: '18px'
    }}
    >
      {(data[rowIndex]['node'][col]/60).toString().split('.')[0] + ' hours'}
      <br/>
      {data[rowIndex]['node'][col] % 60 + ' minutes'}
    </Cell>
  )

  EventIdLinkCell = ({rowIndex, data, ...props}) => {
    let cellStyle = {
      fontFamily: 'Roboto',
      fontSize: '13px',
      lineHeight: '18px'
    };
    let linkStyle={
      color: BernieColors.darkBlue
    }
    if (data[rowIndex]['node'].isOfficial){
      cellStyle.backgroundColor = BernieColors.lightBlue
      linkStyle.color = BernieColors.darkRed
    }
    return (
      <Cell {...props}
      style={cellStyle}
      >
        <a href={publicEventsRootUrl + data[rowIndex]['node']['eventIdObfuscated']} style={linkStyle} target="_blank">{data[rowIndex]['node']['eventIdObfuscated']}</a>
      </Cell>
    )
  }

  ActionCell = ({rowIndex, data, col, ...props}) => {
    let cellStyle = {}
    let iconColor = null

    if (data[rowIndex]['node'].isOfficial) {
      cellStyle.backgroundColor = BernieColors.lightBlue
      iconColor = BernieColors.darkRed
    }

    const actions = {
      delete: {
        execute: () => {
            this._handleEventDeletion([rowIndex])
          },
        icon: 'delete',
        hoverColor: BernieColors.red
      },
      approve: {
        title: (this.props.relay.variables.status === 'PENDING_REVIEW') ? 'mark reviewed' : 'mark approved',
        execute: () => {
            this._handleEventConfirmation([rowIndex])
          },
        icon: 'event_available'
      },
      demote: {
        title: 'move to approval queue',
        execute: () => {
            this._handleEventConfirmation([rowIndex], true)
          },
        icon: 'event_busy',
        hoverColor: BernieColors.red
      },
      edit: {
        title: 'edit',
        execute: () => {
            this._handleEventPreviewOpen(rowIndex, 1);
          },
        icon: 'edit'
      },
      email: {
        title: 'send email',
        execute: () => {
            this._handleSendEmail(rowIndex)
          },
        icon: 'email'
      },
      call: {
        title: 'call for turnout',
        execute: () => {
            this._handleOpenCallAssignment(rowIndex)
          },
        icon: 'phone',
        disabled: (data[rowIndex].node.relatedCallAssignment === null)
      },
      fastForward: {
        title: 'make fast forward request',
        execute: () => {
            this._handleFastForwardRequest([rowIndex])
          },
        icon: 'fast_forward',
        disabled: (data[rowIndex].node.isSearchable === 0)
      },
      downloadRSVPs: {
        title: 'download RSVPs',
        execute: () => {
            this._handleRSVPDownload([rowIndex])
          },
        icon: 'file_download',
        disabled: (data[rowIndex].node.attendeesCount <= 0)
      }
    }

    const renderActionButtons = () => {
      let optionsSet = new Set(approvalFilterOptions[this.props.relay.variables.status].actions)
      if (!this.props.currentUser.isSuperuser)
        optionsSet.delete('delete')
      const options = [...optionsSet]
      return options.map((type) => {
          return (
            <IconButton
              title={actions[type].title}
              onTouchTap={actions[type].execute}
              disabled={(actions[type].disabled !== undefined) ? actions[type].disabled : false}
              key={type}
            >
              <FontIcon className="material-icons" color={iconColor} hoverColor={actions[type].hoverColor || BernieColors.blue}>{actions[type].icon}</FontIcon>
            </IconButton>
          )
        })
    }

    return (
      <Cell {...props} style={cellStyle}>
      <div style={{position: 'relative', left: '-5px'}}>

        {renderActionButtons()}

      </div>
      </Cell>
    )
  }

  renderToolbar() {

    const approvalFilterMenuItems = Object.keys(approvalFilterOptions).map((item) => <MenuItem value={item} key={item} primaryText={approvalFilterOptions[item].text} />)
    const resultLengthOptions = [ 10, 25, 50, 100, 500]
    const resultLengthMenuItems = resultLengthOptions.map((value) => <MenuItem value={value} key={value} primaryText={`${value} Events`} />)

    this._handleEventRequestLengthChange = (event, selectedIndex, value) => {
      this._handleQueryChange({
        numEvents: value
      })

      // Remove selection of rows that are now beyond the view
      let currentSelectedRows = this.state.selectedRows
      let i = currentSelectedRows.length

      while (i--) {
        if (currentSelectedRows[i] >= value) {
          currentSelectedRows.splice(i, 1)
        }
      }

      this.setState({
        selectedRows: currentSelectedRows
      })
    }

    return (
      <Toolbar>
        <ToolbarGroup key={0} float="left">
          <DropDownMenu
            value={this.props.relay.variables.status}
            onChange={(event, index, value) => {
                this._handleQueryChange({status: value});
              }
            }
            autoWidth={true}
            style={{marginRight: 0}}
          >
            {approvalFilterMenuItems}
          </DropDownMenu>
          <DropDownMenu
            value={this.props.relay.variables.numEvents}
            onChange={this._handleEventRequestLengthChange}
            autoWidth={true}
            style={{marginRight: 0, marginLeft: 0}}
          >
            {resultLengthMenuItems}
          </DropDownMenu>
          <ToolbarSeparator style={{marginLeft: 0}} />
          <RaisedButton
            label="Filter"
            labelPosition="after"
            onTouchTap={() => {
              this.setState({showFiltersDialog: true});
            }}
          >
            <FontIcon className="material-icons" style={{position: 'relative', top: '6px', left: '6px'}}>filter_list</FontIcon>
          </RaisedButton>
          
        </ToolbarGroup>
        <ToolbarGroup key={1} float="right">
          <RaisedButton
            label="RSVPs"
            labelPosition="after"
            onTouchTap={() => {
              this.props.history.push('/admin/events/upload-rsvps')
            }}
            style={{marginRight: 0}}
          >
            <FontIcon className="material-icons" style={{position: 'relative', top: '7px', left: '6px'}}>file_upload</FontIcon>
          </RaisedButton>
          <RaisedButton
            label="Create"
            labelPosition="after"
            onTouchTap={() => {
              //this._handleEventCreation(this.state.selectedRows);
              window.location = '/admin/events/create'
            }}
          >
            <FontIcon className="material-icons" style={{position: 'relative', top: '7px', left: '6px'}}>add</FontIcon>
          </RaisedButton>
          <ToolbarSeparator style={{marginLeft: 0}} />
          <RaisedButton
            label="Delete"
            primary={true}
            disabled={(this.state.selectedRows.length == 0)}
            onTouchTap={() => {
              this._handleEventDeletion(this.state.selectedRows);
            }}
          />
          <RaisedButton
            label='Unapprove'
            style={{marginLeft: 0}}
            secondary={false}
            disabled={(this.state.selectedRows.length == 0 || this.props.relay.variables.status === 'PENDING_APPROVAL')}
            onTouchTap={() => {
              this._handleEventConfirmation(this.state.selectedRows, true);
            }}
          />
          <RaisedButton
            label={(this.props.relay.variables.status === 'PENDING_REVIEW') ? 'Mark Reviewed' : 'Mark Approved'}
            style={{marginLeft: 0}}
            secondary={true}
            disabled={(this.state.selectedRows.length == 0 || this.props.relay.variables.status === 'APPROVED')}
            onTouchTap={() => {
              this._handleEventConfirmation(this.state.selectedRows);
            }}
          />
        </ToolbarGroup>
      </Toolbar>
    )
  }

  _reviewEvents = (indexes, pendingReview=false) => {
    let eventIDs = indexes.map(index => {
      return events[index].node.id
    })

    this.refs.eventReviewedHandler.send({
      listContainer: this.props.listContainer,
      eventIDs,
      pendingReview
    })

    this.setState({showEventPreview: false})
    this._deselectRows({indexesToRemove: indexes})
  }

  _deleteEvent = () => {
    let eventsToDelete = this.state.indexesMarkedForDeletion.map(index => {
      return events[index].node.id
    })
    let deleteMsg = this.state.deletionConfirmationMessage;
    if (deleteMsg === 0 || deleteMsg === null)
      deleteMsg = ''

    this.refs.eventDeletionHandler.send({
      listContainer: this.props.listContainer,
      eventIDs: eventsToDelete,
      hostMessage: deleteMsg
    })

    this._handleDeleteModalRequestClose()
    this.setState({showEventPreview: false})
    this._deselectRows({indexesToRemove: this.state.indexesMarkedForDeletion})
  }

  renderDeleteModal() {

    const signature = `Events Team
Bernie 2016`;
    const deleteReasons = [
      {reason: 'Delete Without Message', message: 0},
      {
        reason: 'Event Cancelled by Host',
        message: `This event has been cancelled by the host.

You can find other events in your area by searching our event map at map.berniesanders.com or by visiting Bernie 2016 event central at http://berniesanders.com/events.

When there, enter your zip code and find events in your area.

Thank you for your support!

${signature}`
      },
      {
        reason: 'Event is a Fundraiser',
        message: `Thank you for submitting your event to Bernie 2016 Events Central.

Please note we do not currently approve fundraising events from volunteers and volunteer groups. This is due to complicated FEC requirements.

We recommend you read our guide Organizing without Forming a PAC (https://docs.google.com/document/d/1IgbYG_DY3slh67OMua3t-KjuqMWvggp-ucCr-HcwAZo/edit) - this explains a few things related to fundraising and group costs, and refers you to the FEC for all other fundraising questions.

Thank you again for your support and for helping to spread Bernie's message!

${signature}`
      },
      {
        reason: 'Event mentions ballot / petitions',
        message: `Thank you for your interest in helping gather petition signatures to help get Bernie on the ballot! The campaign currently does not need signatures to qualify for the ballot in your state. But don’t worry, there are other ways you can volunteer to help the campaign.

Here are some things you can do:
  - Host a house party for Bernie (distribute literature, get people signed up, etc.)
  - Table at farmers markets or local community events.
  - Talk up Bernie, and distribute Bernie material at Democratic Party meetings, union meetings, or other civic organizations
  - Write a letter to the editor: "Why I support a Sanders candidacy."  There are helpful talking points at berniesanders.com
  - Spread the word on social media - be sure to like, follow, and promote the official Bernie 2016 Facebook page, www.facebook.com/berniesanders; follow on Instagram, @berniesanders; and Twitter, @berniesanders

When you’re ready to submit your next event, visit berniesanders.com/plan.

Thank you again for your support and for helping to spread Bernie’s message!

${signature}`
      },
      {
        reason: 'Canvass event in non-staff state',
        message: `We're not supporting new canvass events in your state right now, but we encourage you to join an already scheduled canvass or GOTV event in your area.

Canvass events can be found here: http://map.berniesanders.com/#zipcode=&distance=50&sort=time&f%5B%5D=canvassing

GOTV events can be found here:
http://map.berniesanders.com/#zipcode=&distance=50&sort=time&f%5B%5D=gotv

If you'd like to create your own event we encourage you to phone bank, which is an extremely efficient way to reach voters. You can create and host a phone bank event here: https://organize.berniesanders.com/events/create#type=phonebank

Thank you so much for helping to spread Bernie's message!

${signature}`
      },
      {
        reason: 'Lobby Superdelegate',
        message: `The event you posted does not follow guidelines for event creation on Bernie events central. We’ve removed the event from the system.

Please know, it’s not important to worry about superdelegate count when it can change from day-to-day. We interact with superdelegates on a daily basis, sharing Bernie's position on issues and updating them on campaign activities. As such, we ask our volunteers and supporters not to lobby superdelegates directly.

The most important thing you can do right now it to help us increase our pledged delegates, and you can do that by hosting and attending events like phone banks, volunteer meetings, and canvasses, among others.

You can find events in your area by visiting map.berniesanders.com or you can create another event that follows more closely to the important events we mention above. For those events, we give you all the tools you need to run a successful event and to help bring Bernie's message to your area.

Thank you so much for all that you do!

${signature}`
      },
      {
        reason: 'General Deletion Message',
        message: `Your event does not meet parameters at berniesanders.com/plan.

Keep in mind that each event description should include ways that Bernie Supporters can get involved in your event. Please be specific about what you are asking Bernie supporters to do, how they can get involved, and what you might want them to bring with them in support of Bernie.

When in doubt, follow event creation guidelines set forth at berniesanders.com/plan. When you’re ready, you can re-submit your event there.

Thank you again for your support and for helping to spread Bernie’s message!

${signature}`
      },
      {
        // Be sure to keep this as the last option in the array,
        // it's being referenced below as deleteReasons[deleteReasons.length-1]
        reason: 'Custom',
        message: `

${signature}`
      }
    ];
    const deleteReasonMenuItems = deleteReasons.map((item, index) => <MenuItem key={index} value={index} primaryText={item.reason}/>);

    this._handleDeleteModalRequestClose = () => {
      let updatedStateProps = {
          showDeleteEventDialog: false,
          deletionConfirmationMessage: null,
          deletionReasonIndex: null
        };
      if (this.state.activeEventIndex) {
        updatedStateProps['showEventPreview'] = true;
      }
      this.setState(updatedStateProps)
    }

    let numEvents = this.state.indexesMarkedForDeletion.length;
    let dialogTitle = `You are about to delete ${numEvents} event${plurry(numEvents)}.`;

    const standardActions = [
      <FlatButton
        label="Cancel"
        secondary={true}
        onTouchTap={this._handleDeleteModalRequestClose} />,
      <FlatButton
        label={(this.state.deletionConfirmationMessage) ? 'Delete & Send Message' : 'Delete'}
        primary={true}
        disabled={(this.state.deletionConfirmationMessage === null || this.state.deletionConfirmationMessage === deleteReasons[deleteReasons.length-1]['message'] || this.state.deletionConfirmationMessage === '')}
        onTouchTap={this._deleteEvent}
      />
    ];

    let deleteMessage = (
      <div>
        <SelectField
          value={this.state.deletionReasonIndex}
          floatingLabelText="Reason For Deletion"
          onChange={(event, index, value) => {
            this.setState({
              deletionReasonIndex: value,
              deletionConfirmationMessage: deleteReasons[value].message
            })
          }}
          style={{width: '350px'}}
          floatingLabelStyle={{cursor: 'pointer'}}
        >
        {deleteReasonMenuItems}
        </SelectField><br />
        <TextField
          floatingLabelText="Message for Event Host & Attendees"
          value={(this.state.deletionConfirmationMessage === 0) ? '' : this.state.deletionConfirmationMessage}
          disabled={(this.state.deletionConfirmationMessage === 0 || this.state.deletionConfirmationMessage === null)}
          onChange={(event) => {
            this.setState({deletionConfirmationMessage: event.target.value});
          }}
          multiLine={true}
          rowsMax={6}
          fullWidth={true}
          inputStyle={{backgroundColor: 'rgb(250,250,250)'}}
          ref="deleteConfirmationInput"
        />
      </div>
    )

    return (
      <Dialog
        title={dialogTitle}
        actions={standardActions}
        open={this.state.showDeleteEventDialog}
        onRequestClose={this._handleDeleteModalRequestClose}
      >
        {deleteMessage}
      </Dialog>
    )
  }

  renderCreateModal() {

    this._handleCreateModalRequestClose = () => {
      this.setState({
        showCreateEventDialog: false
      })
    }

    return (
      <Dialog
        title='Create an Event'
        open={this.state.showCreateEventDialog}
        onRequestClose={this._handleCreateModalRequestClose}
        bodyStyle={{paddingBottom: '0'}}
      >
        <iframe
          ref="creationForm"
          src="create"
          style={{width: '100%', height: this.state.windowHeight*0.6, border: 'none'}}
        ></iframe>
      </Dialog>
    )
  }

  renderFiltersModal() {

    const standardActions = [
      <FlatButton
        label="Cancel"
        secondary={true}
        onTouchTap={() => {
          this.setState({showFiltersDialog: false});
        }}
      />,
      <FlatButton
        label="Clear"
        secondary={true}
        onTouchTap={() => {
          this._handleRequestFiltersChange({newVars: {}, doNotPreserveOldFilters: true});
          this._handleRequestFiltersChange({filterKey: 'hostFilters', newVars: {}, doNotPreserveOldFilters: true});
        }}
      />,
      <FlatButton
        label="Update Filters"
        primary={true}
        onTouchTap={() => {
          let filtersArray = jQuery(this.refs.eventSearchForm).serializeArray();
          let eventFiltersObject = {}
          let hostFiltersObject = {}

          filtersArray.forEach((filter) => {
            const currentValue = convertType(filter.value)
            if (currentValue !== undefined && currentValue !== ''){
              if (containsInput(filterInputs, filter.name))
                eventFiltersObject[filter.name] = currentValue
              if (containsInput(hostFilterInputs, filter.name))
                hostFiltersObject[filter.name] = currentValue
            }
          })

          this._handleRequestFiltersChange({newVars: eventFiltersObject, doNotPreserveOldFilters: true});
          this._handleRequestFiltersChange({filterKey: 'hostFilters', newVars: hostFiltersObject, doNotPreserveOldFilters: true});
          this.setState({showFiltersDialog: false});
        }}
      />,
    ];

    const containsInput = (inputArray, inputProp, key='name') => {
      let found = false
      for(let i = 0; i < inputArray.length; i++) {
        if (inputArray[i][key] === inputProp) {
          found = true
          break
        }
      }
      return found
    }

    const labelStyle = { display: 'inline', marginRight: '0.5em', fontSize: '0.8em' }

    const FilterInput = ({filterProperty, name, label, type='text'}) => (
      <div>
        <label htmlFor={name} style={labelStyle}>{label}: </label>
        <input
          name={name}
          defaultValue={filterProperty[name]}
          type={type}
        />
      </div>
    );

    const booleanOptions = [
      {
        name: 'Yes',
        value: true
      },
      {
        name: 'No',
        value: false
      }
    ];

    const filterInputs = [
      {name: 'eventIdObfuscated', label: 'Event ID'},
      {name: 'name', label: 'Event Name'},
      {name: 'eventTypeId', label: 'Event Type', type: 'select', options: this.props.listContainer.eventTypes, optionValue: 'id'},
      {name: 'isOfficial', label: 'Official Campaign Event', type: 'select', options: booleanOptions},
      {name: 'isSearchable', label: 'Public Event', type: 'select', options: booleanOptions},
      {name: 'contactPhone', label: 'Host Contact Phone'},
      {name: 'venueName', label: 'Venue Name'},
      {name: 'localTimezone', label: 'Timezone', type: 'select', options: USTimeZones},
      {name: 'venueAddr1', label: 'Address Line 1'},
      {name: 'venueAddr2', label: 'Address Line 2'},
      {name: 'venueCity', label: 'City'},
      {name: 'venueState', label: 'State', type: 'select', options: states, optionValue: 'abbreviation'},
      {name: 'venueZip', label: 'Zip Code'},
      {name: 'latitude', label: 'Latitude', type: 'number'},
      {name: 'longitude', label: 'Longitude', type: 'number'}
    ];

    const hostFilterInputs = [
      {name: 'firstname', label: 'First Name'},
      {name: 'middlename', label: 'Middle Name'},
      {name: 'lastname', label: 'Last Name'},
      {name: 'email', label: 'Email Address'},
      {name: 'phone', label: 'Phone Number'}
    ];

    const FilterSelect = ({filterProperty, name, label, options, optionName='name', optionValue='value'}) => (
      <div>
        <label htmlFor={name} style={labelStyle}>{label}: </label>
        <select
          name={name}
          defaultValue={filterProperty[name]}
        >
          <option value='none'>--</option>
          {options.map((item, index) => {
            return <option key={index} value={item[optionValue]}>{item[optionName]}</option>
          })}
        </select>
      </div>
    );

    const FilterGroup = ({filterProperty, name, inputs, containerStyle}) => (
        <div style={containerStyle}>
          <h3 style={{marginBottom: '0.5em'}}>{name}</h3>
          {inputs.map((input, index) => {
            if (input.type == 'select'){
              return <FilterSelect name={input.name} label={input.label} options={input.options} optionValue={input.optionValue} optionName={input.optionName} key={index} filterProperty={filterProperty} />
            }
            else {
              return <FilterInput name={input.name} label={input.label} type={input.type} key={index} filterProperty={filterProperty} />
            }
          })}
        </div>
      )

    return (
      <Dialog
        actions={standardActions}
        open={this.state.showFiltersDialog}
        onRequestClose={() => {
          this.setState({
            showFiltersDialog: false
          });
        }}
        bodyStyle={{paddingBottom: '0'}}
      >
      <form
        ref='eventSearchForm'
        onSubmit={(e, data) => {
          e.preventDefault();
        }}
      >
        <FilterGroup name='Event Filters' inputs={filterInputs} filterProperty={this.props.relay.variables.filters} containerStyle={{float: 'left', width: '50%'}} />
        <FilterGroup name='Host Filters' inputs={hostFilterInputs} filterProperty={this.props.relay.variables.hostFilters} containerStyle={{marginLeft: '50%'}} />
      </form>
      </Dialog>
    )
  }

  renderEventPreviewModal() {

    let customActions = [
      // <KeyboardActionsInfo key="0" />,
      <FlatButton
        label="Close"
        key="1"
        onTouchTap={this._handlePreviewRequestClose}
      />,
      <FlatButton
        label="Delete"
        key="2"
        primary={true}
        onTouchTap={() => {
          this._handleEventDeletion([this.state.activeEventIndex]);
        }}
      />,
      <FlatButton
        label='Update'
        key="3"
        disabled={this.props.relay.variables.filters.flagApproval === false && this.state.previewTabIndex === 0}
        secondary={true}
        onTouchTap={() => {
          this.refs.eventEdit.refs.component.submit()
        }}
      />
    ]

    this._handlePreviewRequestClose = () => {
      this.setState({
        showEventPreview: false,
        activeEventIndex: null
      })
    }

    let activeEvent = events[this.state.activeEventIndex] ? events[this.state.activeEventIndex].node : null

    return (
      <Dialog
        actions={customActions}
        open={this.state.showEventPreview}
        onRequestClose={this._handlePreviewRequestClose}
        contentStyle={{maxWidth: '1200px', width: '90%'}}
        autoScrollBodyContent={true}
      >
        <Tabs
          value={String(this.state.previewTabIndex)}
          tabItemContainerStyle={{position: 'absolute', top: '0', left: '0', zIndex: 20}}
          inkBarStyle={{position: 'absolute', top: '48px', zIndex: 21}}
          contentContainerStyle={{paddingTop: '24px'}}
          onChange={(tabValue, touchEvent, tab) => {
              if (!tab.props)
                {return}

              this.setState({previewTabIndex: tab.props.tabIndex})
            }}
        >
          <Tab label="Preview" value={'0'} >
            <EventPreview
              event={activeEvent}
              onChangeEventIndex={(n) => {
                this._iterateActiveEvent(n);
              }}
              onEventConfirm={(indexArray) => {
                this._handleEventConfirmation(indexArray);
              }}
              onTabRequest={(eventIndex, tabIndex) => {
                this._handleEventPreviewOpen(eventIndex, tabIndex);
              }}
              onEventDelete={(indexArray) => {
                this._handleEventDeletion(indexArray);
              }}
            />
          </Tab>
          <Tab label="Edit" value={'1'} >
            <EventEdit
              ref="eventEdit"
              onSubmit={ (data) => {
                this._handleEventEdit(activeEvent, data)
              }}
              event={activeEvent}
              listContainer={this.props.listContainer}
            />
          </Tab>
        </Tabs>
      </Dialog>
    )
  }

  _handleRequestRefresh = () => {
    this.forceUpdate()
  }


  _handleRequestFiltersChange = ({newVars, filterKey='filters', doNotPreserveOldFilters=false}) => {
    let oldVars = this.props.relay.variables[filterKey]

    if (doNotPreserveOldFilters) {
      if (filterKey === 'filters' && !newVars.hasOwnProperty('flagApproval')) {
        newVars['flagApproval'] = oldVars['flagApproval']
      }

      this._handleQueryChange({[filterKey]: newVars})
    }
    else
      this._handleQueryChange({[filterKey]: Object.assign(oldVars, newVars)})

    this.setState({selectedRows: []})
  }

  _handleEventPreviewOpen = (eventIndex, tabIndex) => {
    tabIndex = tabIndex ? tabIndex : 0

    this.setState({
      showEventPreview: true,
      activeEventIndex: eventIndex,
      previewTabIndex: tabIndex,
    })
  }

  _iterateActiveEvent = (n) => {
    // Do not iterate if there are no more events available before/after current event

    if (this.state.activeEventIndex === null ||
        this.state.activeEventIndex + n < 0 ||
        this.state.activeEventIndex + n == events.length) {
      return
    }

    this.setState({
      activeEventIndex: this.state.activeEventIndex + n
    })

    let element = ReactDOM.findDOMNode(this.refs.eventEdit)
    element.scrollIntoView && element.scrollIntoView()
  }

  _handleEventCreation = () => {
    this.setState({
      showCreateEventDialog: true
    })
  }

  _handleEventDeletion = (eventIndexes) => {
    this.setState({
      showEventPreview: false,
      showDeleteEventDialog: true,
      indexesMarkedForDeletion: eventIndexes
    })
  }

  _handleEventConfirmation = (eventIndexes, flagApproval=false) => {
    if (this.props.relay.variables.status === 'PENDING_REVIEW' && !flagApproval){
      this._reviewEvents(eventIndexes)
      return
    }

    let eventsToConfirm = []

    events.forEach((event, index) => {
      if (eventIndexes.indexOf(index) !== -1) {
        let node = event.node
        eventsToConfirm.push({
          id: node.id,
          flagApproval
        })
      }
    })

    this.refs.eventEditHandler.send({
      events: eventsToConfirm,
      listContainer: this.props.listContainer
    })

    this._deselectRows({indexesToRemove: eventIndexes})
  }

  _handleSendEmail = (eventIndex) => {
    this.setState({
      showSendEventEmailDialog: true,
      activeEvent: events[eventIndex].node
    })
  }

  _handleOpenCallAssignment = (eventIndex) => {
    const event = events[eventIndex].node
    this.props.history.push(`/call/${event.relatedCallAssignment.id}`)
  }

  _handleFastForwardRequest = (eventIndex) => {
    const eventId = events[eventIndex].node.eventIdObfuscated
    window.open(`/admin/events/${eventId}/emails/create`)
  }

  _handleRSVPDownload = (eventIndex) => {
    const event = events[eventIndex].node
    superagent.get(`/events/${event.eventIdObfuscated}/get-rsvps.json`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        const attendees = JSON.parse(res.text)
        const data = attendees.map((attendee) => flattenJSON(attendee, {ignoreProps: ['create_dt', 'modified_dt', 'geom', 'is_primary', 'cons_addr_id']}))
        downloadCSV(Papa.unparse(data), `${event.eventIdObfuscated}.rsvps.csv`)
      })
  }

  _handleEventEdit = (event, newData) => {
    this._handlePreviewRequestClose()

    newData.id = event.id

    this.refs.eventEditHandler.send({
      events: [newData],
      listContainer: this.props.listContainer
    })
  }

  _handleEventSelect = (eventIndex) => {
    let currentSelectedRows = this.state.selectedRows
    let i = currentSelectedRows.indexOf(eventIndex)

    if (i > -1) {
      currentSelectedRows.splice(i, 1)
    } else {
      currentSelectedRows.push(eventIndex)
    }

    this.setState({
      selectedRows: currentSelectedRows
    })
  }

  _deselectRows = ({indexesToRemove}) => {
    // indexesToRemove argument is optional
    let currentSelectedRows = this.state.selectedRows

    if (indexesToRemove && currentSelectedRows.length != indexesToRemove.length){
      indexesToRemove.forEach( (eventIndex) => {
        let i = currentSelectedRows.indexOf(eventIndex)

        if (i > -1) {
          currentSelectedRows.splice(i, 1)
        }
      })

      currentSelectedRows.forEach( (eventIndex, i) => {
        if (eventIndex > indexesToRemove[0]) {
          currentSelectedRows.splice(i, 1, eventIndex-1)
        }
      })

      this.setState({selectedRows: currentSelectedRows})
    } else {
      this.setState({selectedRows: []})
    }
  }

  _handleRowClick = (clickEvent, targetRowIndex) => {
    this._handleEventPreviewOpen(targetRowIndex, 0)
  }

  _masterCheckBoxChecked = (checkEvent, checked) => {
    let currentSelectedRows = []

    if (checked) {
      for (let i=0; i<events.length; i++) {
        currentSelectedRows.push(i)
      }
    }

    this.setState({
      selectedRows: currentSelectedRows
    })
  }

  _handleQueryChange = (queryParams) => {
    this.setState({loading: true})
    this.props.relay.setVariables(queryParams, (readyState) => {
      if (readyState.ready) {
        this.setState({loading: false})
        setTimeout(() => {
          const relayProps = this.props.relay.variables
          let hash = qs.parse(location.hash.substr(1))
          hash.query = relayProps;
          location.hash = qs.stringify(hash, { encode: false, skipNulls: true })
        }, 500)
      }
    })
  }

  render() {
    events = this.props.listContainer.events ? this.props.listContainer.events.edges : []

    return (
    <div>
      <MutationHandler
        ref='eventDeletionHandler'
        successMessage={`${this.state.indexesMarkedForDeletion.length} event${plurry(this.state.indexesMarkedForDeletion.length)} deleted`}
        mutationName='deleteEvents'
        mutationClass={DeleteEvents}
      />
      <MutationHandler
        ref='eventEditHandler'
        mutationClass={EditEvents}
        mutationName='editEvents'
        successMessage='Event(s) updated successfully'
      />
      <MutationHandler
        ref='eventReviewedHandler'
        mutationClass={ReviewEvents}
        mutationName='reviewEvents'
        successMessage='Event(s) marked reviewed'
      />
      <SendEventMail
        currentUser={this.props.currentUser}
        event={this.state.activeEvent}
        open={this.state.showSendEventEmailDialog}
        onRequestClose={() => {
          this.setState({showSendEventEmailDialog: false})
        }}
      />
      {this.renderDeleteModal()}
      {this.renderCreateModal()}
      {this.renderEventPreviewModal()}
      {this.renderFiltersModal()}
      {this.renderToolbar()}
      <div style={{
        opacity: this.state.loading ? '0.3' : '1',
        transition: 'opacity .2s ease-in'
      }}>
        <Table
          rowHeight={83}
          groupHeaderHeight={35}
          headerHeight={50}
          rowsCount={events.length}
          width={this.state.windowWidth}
          height={this.state.windowHeight - 112}
          // rowClassNameGetter={(index) => (events[index].isOfficial) ? 'officialEventRow' : null}
          onRowDoubleClick={this._handleRowClick}
          {...this.props}>
          <ColumnGroup
            fixed={true}
            header={<this.HeaderCell content="Actions" />}>
            <Column
              header={
                <Cell>
                  <Checkbox
                    checked={(this.state.selectedRows.length > 0)}
                    onCheck={this._masterCheckBoxChecked}
                    checkedIcon={(this.state.selectedRows.length == events.length) ? <FontIcon className="material-icons">check_box</FontIcon> : <FontIcon className="material-icons">indeterminate_check_box</FontIcon>}
                    style={{marginLeft: '15px'}}
                    iconStyle={{color: BernieColors.blue}}
                  />
                </Cell>
              }
              cell={<this.SelectCell data={events} col="select" selectedRows={this.state.selectedRows} />}
              fixed={true}
              width={73}
            />
            <Column
              header={<this.HeaderCell content="Manage" />}
              cell={<this.ActionCell data={events} col="actions" />}
              fixed={true}
              width={approvalFilterOptions[this.props.relay.variables.status].actions.length * 48 + 16}
              align='center'
            />
          </ColumnGroup>
          <ColumnGroup
            header={<this.HeaderCell content="Event" />}
          >
            <Column
              flexGrow={1}
              header={<this.HeaderCell content="ID" />}
              cell={<this.EventIdLinkCell data={events} />}
              width={100}
              align='center'
            />
            <Column
              flexGrow={1}
              header={<this.SortControllerCell content="Type" attribute="eventTypeId" />}
              cell={
                <this.EventTypeCell data={events} col="eventType" attr="name" />
              }
              width={130}
            />
          </ColumnGroup>
          <ColumnGroup
            header={<this.HeaderCell content="Time" />}>
            <Column
              header={<this.SortControllerCell content="Event Date" attribute="startDate" />}
              cell={<this.DateCell data={events} col="startDate" />}
              flexGrow={1}
              width={170}
            />
            <Column
              header={<this.SortControllerCell content="Create Date" attribute="createDate" />}
              cell={<this.DateCell data={events} col="createDate" />}
              flexGrow={1}
              width={170}
            />
          </ColumnGroup>
          <ColumnGroup
            header={<this.HeaderCell content="About" />}>
            <Column
              flexGrow={1}
              header={<this.SortControllerCell content="Event Name" attribute="name" />}
              cell={<this.TextCell data={events} col="name" />}
              width={250}
            />
            <Column
              flexGrow={1}
              header={<this.SortControllerCell content="Description" attribute="description" />}
              cell={<this.NoHTMLCell data={events} col="description" />}
              width={450}
            />
          </ColumnGroup>
          <ColumnGroup
            header={<this.HeaderCell content="Event Host" />}>
            <Column
              flexGrow={1}
              header={<this.HeaderCell content="Email" />}
              cell={<this.HostInfoCell data={events} col="host" info="email" />}
              width={220}
            />
            <Column
              flexGrow={1}
              header={<this.HeaderCell content="Name" />}
              cell={<this.HostInfoCell data={events} col="host" info="name" />}
              width={150}
            />
            <Column
              flexGrow={1}
              header={<this.SortControllerCell content="Phone" attribute="contactPhone" />}
              cell={<this.TextCell data={events} col="contactPhone" />}
              width={100}
            />
          </ColumnGroup>
          <ColumnGroup
            header={<this.HeaderCell content="Detailed Info" />}>
           <Column
              header={<this.SortControllerCell content="Duration" attribute="duration" />}
              cell={<this.DurationCell data={events} col="duration" />}
              flexGrow={1}
              width={110}
            />
            <Column
              flexGrow={1}
              header={<this.SortControllerCell content="Capacity" attribute="capacity" />}
              cell={<this.TextCell data={events} col="capacity" />}
              width={100}
              align='center'
            />
            <Column
              flexGrow={1}
              header={<this.HeaderCell content="RSVPs" />}
              cell={<this.TextCell data={events} col="attendeesCount" />}
              width={100}
              align='center'
            />
          </ColumnGroup>
          <ColumnGroup
            header={<this.HeaderCell content="Event Location" />}>
            <Column
              header={<this.SortControllerCell content="Venue" attribute="venueName" />}
              cell={<this.TextCell data={events} col="venueName" />}
              flexGrow={1}
              width={150}
            />
            <Column
              header={<this.SortControllerCell content="Address" attribute="venueAddr1" />}
              cell={<this.TextCell data={events} col="venueAddr1" />}
              flexGrow={1}
              width={150}
            />
            <Column
              header={<this.SortControllerCell content="City" attribute="venueCity" />}
              cell={<this.TextCell data={events} col="venueCity" />}
              flexGrow={1}
              width={150}
            />
            <Column
              header={<this.SortControllerCell content="State" attribute="venueState" />}
              cell={<this.TextCell data={events} col="venueState" />}
              flexGrow={1}
              width={80}
              align='center'
            />
            <Column
              header={<this.SortControllerCell content="Zip Code" attribute="venueZip" />}
              cell={<this.TextCell data={events} col="venueZip" />}
              flexGrow={1}
              width={120}
              align='center'
            />
            <Column
              header={<this.SortControllerCell content="Latitude" attribute="latitude" />}
              cell={<this.TextCell data={events} col="latitude" />}
              flexGrow={1}
              width={150}
              align='center'
            />
            <Column
              header={<this.SortControllerCell content="Longitude" attribute="longitude" />}
              cell={<this.TextCell data={events} col="longitude" />}
              flexGrow={1}
              width={150}
              align='center'
            />
          </ColumnGroup>
        </Table>
      </div>
    </div>
    )
  }
}

const getDefaultQuery = () => {
  const hashParams = convertType(qs.parse(location.hash.substr(1), { strictNullHandling: true }))
  let defaultParams = {
    numEvents: 50,
    sortField: 'startDate',
    sortDirection: 'ASC',
    status: 'APPROVED',
    filters: {},
    hostFilters: {}
  }
  if (hashParams.query){
    try {
      let newQueryParams = Object.assign({}, defaultParams, hashParams.query)
      newQueryParams.filters = Object.assign({}, defaultParams.filters, hashParams.query.filters)
      return newQueryParams
    }
    catch(ex) {
      console.error('Invalid query parameters', ex)
    }
  }

  return defaultParams
}

export default Relay.createContainer(AdminEventsSection, {
  initialVariables: getDefaultQuery(),
  fragments: {
    currentUser: () => Relay.QL`
      fragment on User {
        ${SendEventMail.getFragment('currentUser')}
        isSuperuser
      }
    `,
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        ${EventEdit.getFragment('listContainer')}
        ${DeleteEvents.getFragment('listContainer')}
        ${ReviewEvents.getFragment('listContainer')}
        ${EditEvents.getFragment('listContainer')}
        eventTypes {
          id
          name
        }
        events(
          first: $numEvents
          eventFilterOptions: $filters
          hostFilterOptions: $hostFilters
          status: $status
          sortField: $sortField
          sortDirection: $sortDirection
        ) {
          edges {
            cursor
            node {
              name
              id
              host {
                id
                firstName
                lastName
                email
              }
              eventType {
                id
                name
              }
              eventIdObfuscated
              flagApproval
              isOfficial
              description
              venueName
              latitude
              longitude
              venueZip
              venueCity
              venueState
              venueAddr1
              venueAddr2
              venueCountry
              venueDirections
              createDate
              startDate
              localTimezone
              localUTCOffset
              duration
              capacity
              attendeeVolunteerShow
              attendeeVolunteerMessage
              isSearchable
              publicPhone
              contactPhone
              hostReceiveRsvpEmails
              rsvpUseReminderEmail
              rsvpEmailReminderHours
              attendeesCount
              relatedCallAssignment {
                id
              }
            }
          }
        }
      }
    `
  }
})
