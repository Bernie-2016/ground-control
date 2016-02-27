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
  else if (value != '' && !isNaN(value))
    return Number(value)
  else if (value)
    return String(value)
  else {
    return undefined
  }
}

JSON.flatten = (data, options) => {
  let result = {}
  let addProp = (prop, val) => {
    if (options.ignoreProps && options.ignoreProps.length > 0){
      const props = prop.split('.')
      for (const item of props) {
        if (options.ignoreProps.indexOf(item) > -1)
          return
      }
    }
    result[prop] = val
  }
  let recurse = (cur, prop) => {
    if (Object(cur) !== cur) {
      addProp(prop, cur)
    }
    else if (Array.isArray(cur)) {
      let l=cur.length;
      for(let i=0; i<l; i++)
        recurse(cur[i], `${prop}[${i}]`)

    if (l == 0)
      addProp(prop, [])
    }
    else {
      let isEmpty = true
      for (let p in cur) {
        isEmpty = false
        recurse(cur[p], prop ? `${prop}.${p}` : p)
      }
      if (isEmpty && prop)
        addProp(prop, {})
    }
  }
  recurse(data, '')
  return result
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

let events = []

class AdminEventsSection extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showDeleteEventDialog: false,
      showEventPreview: false,
      showCreateEventDialog: false,
      showFiltersDialog: false,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      selectedRows: [],
      indexesMarkedForDeletion: [],
      activeEventIndex: null,
      previewTabIndex: 0,
      userMessage: '',
      deletionConfirmationMessage: null,
      deletionReasonIndex: null,
      actionButtons: new Set(['delete', 'demote', 'approve', 'edit', 'email', 'downloadRSVPs']),
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
        icon: 'event_available',
        disabled: this.props.relay.variables.status === 'APPROVED'
      },
      demote: {
        title: 'move to approval queue',
        execute: () => {
            this._handleEventConfirmation([rowIndex], true)
          },
        icon: 'event_busy',
        hoverColor: BernieColors.red,
        disabled: this.props.relay.variables.status === 'PENDING_APPROVAL'
      },
      edit: {
        title: 'edit',
        execute: () => {
            this._handleEventPreviewOpen(rowIndex, 1);
          },
        icon: 'edit',
      },
      email: {
        title: 'email',
        execute: () => {
            this._handleEventEmail([rowIndex])
          },
        icon: 'email',
        disabled: (data[rowIndex].node.flagApproval === true || data[rowIndex].node.isSearchable === 0)
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

    const getActionButtons = (actionTypes) => {
      return actionTypes.map((key) => {
        const type = actions[key]
        return (
          <IconButton
            title={type.title}
            onTouchTap={type.execute}
            disabled={(type.disabled !== undefined) ? type.disabled : false}
            key={key}
          >
            <FontIcon className="material-icons" color={iconColor} hoverColor={type.hoverColor || BernieColors.blue}>{type.icon}</FontIcon>
          </IconButton>
        )
      })
    }

    return (
      <Cell {...props} style={cellStyle}>
      <div style={{position: 'relative', left: '-5px'}}>

        {getActionButtons([...this.state.actionButtons])}

      </div>
      </Cell>
    )
  }

  renderToolbar() {
    const approvalFilterOptions = [
      {value: 'PENDING_APPROVAL', 'text': 'Pending Approval'},
      {value: 'PENDING_REVIEW', 'text': 'Pending Review'},
      {value: 'APPROVED', 'text': 'Public Events'},
      {value: 'FAST_FWD_REQUEST', 'text': 'FastFwd Requests'}
    ]

    const approvalFilterMenuItems = approvalFilterOptions.map((item) => <MenuItem value={item.value} key={item.value} primaryText={item.text} />)

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
          >
            {approvalFilterMenuItems}
          </DropDownMenu>
          <DropDownMenu
            value={this.props.relay.variables.numEvents}
            onChange={this._handleEventRequestLengthChange}
            autoWidth={false}
            style={{width: '140px', marginRight: '0'}}
          >
            {resultLengthMenuItems}
          </DropDownMenu>

          <RaisedButton
            label="Filter"
            labelPosition="after"
            onTouchTap={() => {
              this.setState({showFiltersDialog: true});
            }}
          >
            <FontIcon className="material-icons" style={{position: 'relative', top: '6px', left: '6px'}}>filter_list</FontIcon>
          </RaisedButton>
          <RaisedButton
            label="Upload RSVPs"
            labelPosition="after"
            onTouchTap={() => {
              this.props.history.push('/admin/events/upload-rsvps')
            }}
          >
            <FontIcon className="material-icons" style={{position: 'relative', top: '6px', left: '6px'}}>file_upload</FontIcon>
          </RaisedButton>

        </ToolbarGroup>
        <ToolbarGroup key={1} float="right">
          <RaisedButton
            label="Create"
            onTouchTap={() => {
              //this._handleEventCreation(this.state.selectedRows);
              window.location = '/admin/events/create'
            }}
          />
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

    this.props.relay.forceFetch()
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
​
Please note we do not approve fundraisers without prior campaign contact.
​
You can resubmit your event following guidelines at BernieSanders.com/plan.
​
Also, we recommend you read our guide Organizing with Forming a PAC (https://docs.google.com/document/d/1IgbYG_DY3slh67OMua3t-KjuqMWvggp-ucCr-HcwAZo/edit) - this explains a few things related to fundraising and group costs, and refers you to the FEC for all other fundraising questions.
​
You can resubmit your event following guidelines at BernieSanders.com/plan.
​
Thank you again for your support and for helping to spread Bernie's message!

${signature}`
      },
      {
        reason: 'Event mentions the sale of merchandise',
        message: `Thank you for submitting your event to Bernie 2016 Events Central.

Please note we do not approve events that feature merchandise sales, neither official nor unofficial merchandise sales are sanctioned by the campaign at your event. This is due to complicated FEC requirements for fundraising.

We recommend you read our guide Organizing with Forming a PAC - this explains a few things related to fundraising and group costs, and refers you to the FEC for all other fundraising questions.

You can resubmit your event following guidelines at berniesanders.com/plan.

Thank you again for your support and for helping to spread Bernie’s message!

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
        reason: 'Canvass event in non-canvass state',
        message: `Thank you for submitting your canvass event.  At the moment, we're not running volunteer-led canvasses in that area, however we do have other very important tasks where we'd like your help.

In particular, we're asking volunteers to host phone banks to call voters in states with upcoming caucuses/primaries. You can create your phone bank event right here: https://organize.berniesanders.com/events/create#type=phonebank

Again, thank you so much for your willingness to help spread Bernie's message.

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
          rowsMax={11}
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
          let eventFiltersObject = {};
          let hostFiltersObject = {};

          filtersArray.forEach((filter) => {
            console.log(filter)
            const currentValue = convertType(filter.value)
            if (currentValue != undefined){
              if (containsInput(filterInputs, filter.name))
                eventFiltersObject[filter.name] = currentValue
              if (containsInput(hostFilterInputs, filter.name))
                hostFiltersObject[filter.name] = currentValue
            }
          });

          console.log(eventFiltersObject, hostFiltersObject);

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
          tabItemContainerStyle={{position: 'absolute', top: '0', left: '0', zIndex: '2'}}
          inkBarStyle={{position: 'absolute', top: '48px', zIndex: '2'}}
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

  _handleEventEmail = (eventIndex) => {
    let eventId = events[eventIndex].node.id

    this.props.history.push(`/admin/events/${eventId}/emails/create`)
  }

  _handleRSVPDownload = (eventIndex) => {
    const event = events[eventIndex].node
    const data = event.attendees.map(
      (attendee) => JSON.flatten(attendee, {ignoreProps: ['__dataID__']})
    )

    let options = {
      data,
      fields: Object.keys(data[0])
    }

    json2csv(options, (err, csv) => {
      if (err) console.log(err);

      let byteNumbers = new Uint8Array(csv.length);

      for (let i = 0; i < csv.length; i++){
        byteNumbers[i] = csv.charCodeAt(i);
      }
      let blob = new Blob([byteNumbers], {type: "text/csv"});

          // Construct the uri
      let uri = URL.createObjectURL(blob);

      // Construct the <a> element
      let link = document.createElement("a");
      link.download = `Event RSVPs (${event.eventIdObfuscated}).csv`;
      link.href = uri;

      document.body.appendChild(link);
      link.click();

      // Cleanup the DOM
      document.body.removeChild(link);
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
    console.log('loading')
    this.props.relay.setVariables(queryParams, (readyState) => {
      if (readyState.ready) {
        setTimeout(() => {
          const relayProps = this.props.relay.variables;
          let hash = qs.parse(location.hash.substr(1));
          hash.query = relayProps;
          console.log('finished')
          location.hash = qs.stringify(hash, { encode: false, skipNulls: true });
        }, 500);
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
        ids={[]}
        open={true}
        onRequestClose={() => {console.log('close')}}
        handleCancel={() => {console.log('cancelled')}}
      />
      {this.renderDeleteModal()}
      {this.renderCreateModal()}
      {this.renderEventPreviewModal()}
      {this.renderFiltersModal()}
      {this.renderToolbar()}
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
            width={this.state.actionButtons.size * 48 + 16}
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
    )
  }
}

const getDefaultQuery = () => {
  const hashParams = convertType(qs.parse(location.hash.substr(1), { strictNullHandling: true }))
  let defaultParams = {
    numEvents: 100,
    sortField: 'startDate',
    sortDirection: 'ASC',
    status: 'PENDING_REVIEW',
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
              attendees {
                firstName
                lastName
                phone
                email
                address {
                  city
                  state
                  zip
                }
              }
            }
          }
        }
      }
    `
  }
})
