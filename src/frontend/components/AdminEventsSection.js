import React from 'react'
import ReactDOM from 'react-dom'
import Relay from 'react-relay'
import EventPreview from './EventPreview'
import EventEdit from './EventEdit'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle, SelectField, DropDownMenu, DropDownIcon, Dialog, Tabs, Tab, FlatButton, RaisedButton, IconButton, FontIcon, Checkbox, TextField} from 'material-ui'
import {Table, Column, ColumnGroup, Cell} from 'fixed-data-table'
import {BernieText, BernieColors} from './styles/bernie-css'
import moment from 'moment'
import {states} from './data/states'
import {USTimeZones} from './data/USTimeZones'

import IconMenu from 'material-ui/lib/menus/icon-menu'
import MenuItem from 'material-ui/lib/menus/menu-item'
import MutationHandler from './MutationHandler'
import DeleteEvents from '../mutations/DeleteEvents'
import EditEvents from '../mutations/EditEvents'

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
      approveOnUpdate: true,
      deletionConfirmationMessage: null,
      deletionReasonIndex: null,
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

      this.props.relay.setVariables({
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

  EventLinkCell = ({rowIndex, data, col, ...props}) => (
    <Cell {...props}
    style={{
      fontFamily: 'Roboto',
      fontSize: '13px',
      lineHeight: '18px'
    }}
    >
      <a href={'https://secure.berniesanders.com/page/event/detail/' + data[rowIndex]['node'][col]} target="_blank">{data[rowIndex]['node'][col]}</a>
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

  HostInfoCell = ({rowIndex, data, col, info, ...props}) => (
    <Cell {...props}
    style={{
      fontFamily: 'Roboto',
      fontSize: '13px',
      lineHeight: '18px'
    }}
    >
      {(info == 'name' && data[rowIndex]['node'] && data[rowIndex]['node'][col]) ? data[rowIndex]['node'][col]['firstName'] + ' ' + data[rowIndex]['node'][col]['lastName'] : (data[rowIndex] && data[rowIndex]['node'] && data[rowIndex]['node'][col] ? data[rowIndex]['node'][col][info] : '')}
    </Cell>
  )

  EventTypeCell = ({rowIndex, data, col, attr, ...props}) => (
    <Cell {...props}
    style={{
      fontFamily: 'Roboto',
      fontSize: '13px',
      lineHeight: '18px'
    }}
    >
      {data[rowIndex]['node'] ? data[rowIndex]['node'][col][attr] : ''}
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

  ActionCell = ({rowIndex, data, col, ...props}) => (
    <Cell {...props}>
    <div style={{position: 'relative', left: '-5px'}}>
      {/*
        <IconButton
        title="preview"
        onTouchTap={function(){
          this._handleEventPreviewOpen(rowIndex, 0);
        }.bind(this)}
      >
        <FontIcon className="material-icons" hoverColor={BernieColors.blue}>search</FontIcon>
      </IconButton>
      <IconButton
        title="view public event"
        onTouchTap={function(){
          this._handlePublicEventOpen(rowIndex);
        }.bind(this)}
      >
        <FontIcon className="material-icons" hoverColor={BernieColors.blue}>open_in_new</FontIcon>
      </IconButton>

      <IconButton
        title="edit"
        onTouchTap={function(){
          this._handleEventPreviewOpen(rowIndex, 1);
        }.bind(this)}
      >
        <FontIcon className="material-icons" hoverColor={BernieColors.blue}>edit</FontIcon>
      </IconButton>

      <IconButton
        title="duplicate"
        onTouchTap={function(){
          this._handleEventPreviewOpen(rowIndex, 1);
        }.bind(this)}
      >
        <FontIcon className="material-icons" hoverColor={BernieColors.blue}>content_copy</FontIcon>
      </IconButton>

      */}

      <IconButton
        title="delete"
        onTouchTap={() => {
          this._handleEventDeletion([rowIndex]);
        }}
      >
        <FontIcon className="material-icons" hoverColor={BernieColors.red}>delete</FontIcon>
      </IconButton>

      <IconButton
        title="approve"
        disabled={this.props.relay.variables.filters.flagApproval === false}
        onTouchTap={() => {
          this._handleEventConfirmation([rowIndex]);
        }}
      >
        <FontIcon className="material-icons" hoverColor={BernieColors.blue}>event_available</FontIcon>
      </IconButton>

      <IconButton
        title="email"
        disabled={(data[rowIndex].node.flagApproval === true || data[rowIndex].node.isSearchable === 0)}
        onTouchTap={() => {
          this._handleEventEmail([rowIndex])
        }}
        >
          <FontIcon className="material-icons" hoverColor={BernieColors.blue}>email</FontIcon>
      </IconButton>

      {/*
        IconMenu does not not work inside of fixed-data-table cells because of overflow:hidden on parent divs;
        The plan is to use https://github.com/tajo/react-portal to overcome this limitation
      */}
      {/*
      <IconMenu
        iconButtonElement={<FontIcon className="material-icons" hoverColor={BernieColors.blue}>more_vert</FontIcon>}
        desktop={true}
        openDirection="bottom-right"
      >
        <MenuItem index={0} primaryText="Refresh" leftIcon={<FontIcon className="material-icons">delete</FontIcon>} />
        <MenuItem index={1} primaryText="Send feedback" leftIcon={<FontIcon className="material-icons">delete</FontIcon>} />
        <MenuItem index={2} primaryText="Settings" leftIcon={<FontIcon className="material-icons">delete</FontIcon>} />
      </IconMenu>
      */}

    </div>
    </Cell>
  )

  renderToolbar() {

    const approvalFilterOptions = [
      {value: 1, 'text': 'Pending Approval'},
      {value: 0, 'text': 'Approved Events'}
    ];
    const approvalFilterMenuItems = approvalFilterOptions.map((item) => <MenuItem value={item.value} key={item.value} primaryText={item.text} />);

    const resultLengthOptions = [ 10, 25, 50, 100];
    const resultLengthMenuItems = resultLengthOptions.map((value) => <MenuItem value={value} key={value} primaryText={`${value} Events`} />);

    this._handleEventRequestLengthChange = (event, selectedIndex, value) => {
      this.props.relay.setVariables({
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
            value={this.props.relay.variables.filters.flagApproval ? 1 : 0}
            onChange={(event, index, value) => {
              this._handleRequestFiltersChange({flagApproval: (value == 1)});
            }}
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
          {/*IconMenus are just broken right now
          <IconMenu
            iconButtonElement={<FontIcon className="material-icons" hoverColor={BernieColors.blue}>filter_list</FontIcon>}
            desktop={true}
            // multiple={true}
            closeOnItemTouchTap={false}
            openDirection="bottom-right"
            style={{ position: 'relative', top: '15px' }}
            menuStyle={{ maxHeight: '300px' }}
          >
            {states.map((item, index) => {
              return <MenuItem index={index} key={index} primaryText={item.abbreviation} />
            })}
          </IconMenu>*/}
          {/*<div
            style={{ position: 'relative', top: '20px', display: 'inline' }}
          >
            <label htmlFor="stateSelect" style={{ display: 'inline', marginRight: '0.5em', fontSize: '0.8em' }}>Filter by State</label>
            <select
              id='stateSelect'
              onChange={(event) => {
                let updatedValue = event.target.value;
                if (updatedValue == 'none'){updatedValue = null}
                this._handleRequestFiltersChange({'venueState': updatedValue});
              }}
            >
              <option value='none'>--</option>
              {states.map((item, index) => {
                return <option key={index} value={item.abbreviation}>{item.name}</option>
              })}
            </select>
          </div>*/}
          {/*<IconButton
            iconClassName="material-icons"
            tooltipPosition="bottom-center"
            title="Refresh Events"
            style={{float: 'left', top: '5px'}}
            tooltipStyles={{zIndex: 10}}
            onTouchTap={() => {
              this._handleRequestRefresh();
            }}
          >refresh</IconButton>*/}
          <RaisedButton
            label="More Filters"
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
            label="Approve Selected"
            style={{marginLeft: 0}}
            secondary={true}
            disabled={(this.state.selectedRows.length == 0 || this.props.relay.variables.filters.flagApproval === false)}
            onTouchTap={() => {
          this._handleEventConfirmation(this.state.selectedRows);
        }}
          />
        </ToolbarGroup>
      </Toolbar>
    )
  }

  _deleteEvent = () => {
    let events = this.props.listContainer.events.edges
    let eventsToDelete = this.state.indexesMarkedForDeletion.map(index => {
      return events[index].node.id
    })

    this.refs.eventDeletionHandler.send({
      listContainer: this.props.listContainer,
      eventIDs: eventsToDelete,
      hostMessage: this.state.deletionConfirmationMessage
    })

    this.setState({showEventPreview: false})
    this._handleDeleteModalRequestClose()
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

Please note we do not approve fundraisers without prior campaign contact.

You can resubmit your event following guidelines at BernieSanders.com/plan.

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
    let dialogTitle = `You are about to delete ${numEvents} event${(numEvents > 1) ? 's' : ''}.`;

    const standardActions = [
      <FlatButton
        label="Cancel"
        secondary={true}
        onTouchTap={this._handleDeleteModalRequestClose} />,
      <FlatButton
        label="Delete"
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
          style={{cursor: 'pointer'}}
        >
        {deleteReasonMenuItems}
        </SelectField><br />
        <TextField
          floatingLabelText="Message for Event Host"
          value={(this.state.deletionConfirmationMessage === 0) ? '' : this.state.deletionConfirmationMessage}
          disabled={(this.state.deletionConfirmationMessage === 0 || this.state.deletionConfirmationMessage === null)}
          onChange={(event) => {
            this.setState({deletionConfirmationMessage: event.target.value});
          }}
          multiLine={true}
          rowsMax={11}
          fullWidth={true}
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
          this._handleRequestFiltersChange({}, true);
          this.setState({showFiltersDialog: false});
        }}
      />,
      <FlatButton
        label="Update Filters"
        primary={true}
        onTouchTap={() => {
          let filtersArray = jQuery(this.refs.eventSearchForm).serializeArray();
          let filtersObject = {};
          filtersArray.forEach((filter) => {
            if (filter.value && filter.value != 'none'){
              filtersObject[filter.name] = String(filter.value);
            }
            else {
              delete filtersObject[filter.name];
            }
          });
          this._handleRequestFiltersChange(filtersObject, true);
          this.setState({showFiltersDialog: false});
        }}
      />,
    ];

    const labelStyle = { display: 'inline', marginRight: '0.5em', fontSize: '0.8em' }

    const FilterInput = ({name, label, type='text'}) => (
      <div>
        <label htmlFor={name} style={labelStyle}>{label}: </label>
        <input
          name={name}
          defaultValue={this.props.relay.variables.filters[name]}
          type={type}
        />
      </div>
    );

    const FilterSelect = ({name, label, options, optionName='name', optionValue='value'}) => (
      <div>
        <label htmlFor={name} style={labelStyle}>{label}: </label>
        <select
          name={name}
          defaultValue={this.props.relay.variables.filters[name]}
        >
          <option value='none'>--</option>
          {options.map((item, index) => {
            return <option key={index} value={item[optionValue]}>{item[optionName]}</option>
          })}
        </select>
      </div>
    );

    const filterInputs = [
      {name: 'eventIdObfuscated', label: 'Event ID'},
      {name: 'name', label: 'Event Name'},
      {name: 'eventTypeId', label: 'Event Type', type: 'select', options: this.props.listContainer.eventTypes, optionValue: 'id'},
      {name: 'contactPhone', label: 'Host Contact Phone'},
      {name: 'venueName', label: 'Venue Name'},
      {name: 'localTimezone', label: 'Timezone', type: 'select', options: USTimeZones},
      {name: 'venueState', label: 'State', type: 'select', options: states, optionValue: 'abbreviation'},
      {name: 'venueCity', label: 'City'},
      {name: 'venueZip', label: 'Zip Code'},
      {name: 'latitude', label: 'Latitude', type: 'number'},
      {name: 'longitude', label: 'Longitude', type: 'number'},
    ];

    let updateFilters = (event) => {
      let updatedValue = event.target.value

      if (updatedValue == 'none')
        {updatedValue = null}

      let updatedFilters = {}
      updatedFilters[event.target.name] = updatedValue

      this._handleRequestFiltersChange(updatedFilters)
    }

    return (
      <Dialog
        title='Event Filters'
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
        {filterInputs.map((input, index) => {
          if (input.type == 'select'){
            return <FilterSelect name={input.name} label={input.label} options={input.options} optionValue={input.optionValue} optionName={input.optionName} key={index} />
          }
          else {
            return <FilterInput name={input.name} label={input.label} type={input.type} key={index} />
          }
        })}
      </form>
      </Dialog>
    )
  }

  renderEventPreviewModal() {
    let events = this.props.listContainer.events.edges

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
        label={(this.state.previewTabIndex == 0) ? 'Approve' : (this.state.approveOnUpdate ? 'Update and Approve' : 'Update')}
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
              onFieldChanged={(fieldName, val) => {
                if (fieldName === 'flagApproval') {
                  if (val === true)
                    this.setState({approveOnUpdate: false})
                  else
                    this.setState({approveOnUpdate: true})
                }
              }}
            />
          </Tab>
        </Tabs>
      </Dialog>
    )
  }

  _handleRequestRefresh = () => {
    this.forceUpdate()
  }


  _handleRequestFiltersChange = (newVars, force) => {
    let oldVars = this.props.relay.variables.filters

    if (force) {
      if (!newVars.hasOwnProperty('flagApproval')) {
        newVars['flagApproval'] = oldVars['flagApproval']
      }

      this.props.relay.setVariables({filters: newVars})
    } else {
      this.props.relay.setVariables(Object.assign(oldVars, newVars))
    }

    this.setState({selectedRows: []})
  }

  _handleEventPreviewOpen = (eventIndex, tabIndex) => {
    tabIndex = tabIndex ? tabIndex : 0

    this.setState({
      showEventPreview: true,
      activeEventIndex: eventIndex,
      previewTabIndex: tabIndex,
      approveOnUpdate: true
    })
  }

  _handlePublicEventOpen = (eventIndex) => {
    let events = this.props.listContainer.events.edges

    window.open('https://secure.berniesanders.com/page/event/detail/' + events[eventIndex]['node']['eventIdObfuscated'])
  }

  _iterateActiveEvent = (n) => {
    // Do not iterate if there are no more events available before/after current event
    let events = this.props.listContainer.events.edges

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

  _handleEventConfirmation = (eventIndexes) => {
    let events = this.props.listContainer.events.edges
    let eventsToConfirm = []

    events.forEach((event, index) => {
      if (eventIndexes.indexOf(index) !== -1) {
        let node = event.node
        eventsToConfirm.push({
          id: node.id,
          flagApproval: false
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
    let events = this.props.listContainer.events.edges
    let eventId = events[eventIndex].node.id

    this.props.history.push(`/admin/events/${eventId}/emails/create`)
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
    let events = this.props.listContainer.events.edges

    if (checked) {
      for (let i=0; i<events.length; i++) {
        currentSelectedRows.push(i)
      }
    }

    this.setState({
      selectedRows: currentSelectedRows
    })
  }

  render() {
    let events = this.props.listContainer.events.edges;

    return (
    <div>
      <MutationHandler
        ref='eventDeletionHandler'
        successMessage='Event deleted!'
        mutationClass={DeleteEvents}
      />
      <MutationHandler
        ref='eventEditHandler'
        mutationClass={EditEvents}
        successMessage="Events edited successfully!"
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
            width={180}
            align='center'
          />
        </ColumnGroup>
        <ColumnGroup
          header={<this.HeaderCell content="Event" />}
        >
          <Column
            flexGrow={1}
            header={<this.HeaderCell content="ID" />}
            cell={<this.EventLinkCell data={events} col="eventIdObfuscated" />}
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
          header={<this.HeaderCell content="Event Host" />}>
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
          <Column
            flexGrow={1}
            header={<this.HeaderCell content="Email" />}
            cell={<this.HostInfoCell data={events} col="host" info="email" />}
            width={220}
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

export default Relay.createContainer(AdminEventsSection, {
  initialVariables: {
    numEvents: 100,
    sortField: 'startDate',
    sortDirection: 'ASC',
    filters: {flagApproval: true}
  },
  fragments: {
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        ${EventEdit.getFragment('listContainer')}
        ${DeleteEvents.getFragment('listContainer')}
        ${EditEvents.getFragment('listContainer')}
        eventTypes {
          id
          name
        }
        events(
          first: $numEvents
          filterOptions: $filters
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
            }
          }
        }
      }
    `
  }
})
