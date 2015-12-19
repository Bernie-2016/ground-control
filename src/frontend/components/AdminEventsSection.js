import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import {EventPreview, EventEdit} from './EventView';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle, SelectField, DropDownMenu, DropDownIcon, Dialog, Tabs, Tab, FlatButton, RaisedButton, IconButton, FontIcon, Checkbox, TextField, Snackbar} from 'material-ui';
import {Table, Column, ColumnGroup, Cell} from 'fixed-data-table';
import {BernieText, BernieColors} from './styles/bernie-css';

import IconMenu from 'material-ui/lib/menus/icon-menu';
import MenuItem from 'material-ui/lib/menus/menu-item';
import MutationHandler from './MutationHandler';
import DeleteEvents from '../mutations/DeleteEvents';

const keyboardActionStyles = {
  text: {fontSize: '0.9em', top: '-7px', color: BernieColors.gray, cursor: 'default'},
  icon: {cursor: 'default'}
};
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
);

class AdminEventsSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDeleteEventDialog: false,
      showEventPreview: false,
      showCreateEventDialog: false,
      filterOptionsIndex: 0,
      tableWidth: window.innerWidth,
      tableHeight: window.innerHeight - 112,
      selectedRows: [],
      indexesMarkedForDeletion: [],
      activeEventIndex: null,
      previewTabIndex: 0,
      userMessage: '',
      undoAction: function(){console.log('undo')}
    };
    window.addEventListener('resize', this._handleResize);
  }

  _handleResize = (e) => {
    this.setState({
      tableWidth: window.innerWidth,
      tableHeight: window.innerHeight - 112
    });
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
      lineHeight: '18px',
    }}
    >
      {data[rowIndex]['node'][col]}
    </Cell>
  )

  HostInfoCell = ({rowIndex, data, col, info, ...props}) => (
    <Cell {...props}
    style={{
      fontFamily: 'Roboto',
      fontSize: '13px',
      lineHeight: '18px',
    }}
    >
      {(info == 'name') ? data[rowIndex]['node'][col]['firstName'] + ' ' + data[rowIndex]['node'][col]['lastName'] : data[rowIndex]['node'][col][info]}
    </Cell>
  )

  EventTypeCell = ({rowIndex, data, col, ...props}) => (
    <Cell {...props}
    style={{
      fontFamily: 'Roboto',
      fontSize: '13px',
      lineHeight: '18px',
    }}
    >
      {data[rowIndex]['node'][col]['name']}
    </Cell>
  )

  DateCell = ({rowIndex, data, col, ...props}) => (
    <Cell {...props}
    style={{
      fontFamily: 'Roboto',
      fontSize: '13px',
      lineHeight: '18px',
    }}
    >
      {new Date(data[rowIndex]['node']['startDate']).toString()}
    </Cell>
  )

  DurationCell = ({rowIndex, data, col, ...props}) => (
    <Cell {...props}
    style={{
      fontFamily: 'Roboto',
      fontSize: '13px',
      lineHeight: '18px',
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
        onTouchTap={() => {
          this._handleEventConfirmation([rowIndex]);
        }}
      >
        <FontIcon className="material-icons" hoverColor={BernieColors.blue}>event_available</FontIcon>
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
    let filterOptions = [
      { payload: '1', text: 'Pending Approval' },
      { payload: '2', text: 'Approved Events' },
      { payload: '3', text: 'Past Events' }
    ];

    let resultLengthOptions = [
       { payload: 10, text: '10 Events' },
       { payload: 25, text: '25 Events' },
       { payload: 50, text: '50 Events' },
       { payload: 100, text: '100 Events' },
       // { payload: 500, text: '500 Events' },
    ];

    let resultLengthOptionsIndex = 0;

    resultLengthOptions.forEach((option, index)=>{
      if (option.payload == this.props.relay.variables.numEvents){
        resultLengthOptionsIndex = index;
      }
    });

    this._handleEventRequestLengthChange = (event, selectedIndex, menuItem) => {
      this.props.relay.setVariables({
        numEvents: menuItem.payload,
      });

      // Remove selection of rows that are now beyond the view
      let currentSelectedRows = this.state.selectedRows;
      let i = currentSelectedRows.length;
      while (i--) {
        if (currentSelectedRows[i] >= menuItem.payload){
          currentSelectedRows.splice(i, 1);
        }
      }
      this.setState({
        selectedRows: currentSelectedRows
      });
    }

  return (
      <Toolbar>
        <ToolbarGroup key={0} float="left">
          {/*<DropDownMenu
            menuItems={filterOptions}
            selectedIndex={this.state.filterOptionsIndex}
            menuItemStyle={BernieText.menuItem}
            style={{marginRight: '0'}}
          />*/}
          <DropDownMenu
            menuItems={resultLengthOptions}
            selectedIndex={resultLengthOptionsIndex}
            menuItemStyle={BernieText.menuItem}
            onChange={this._handleEventRequestLengthChange}
            autoWidth={false}
            style={{width: '140px', marginRight: '0'}}
          />
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
        </ToolbarGroup>
        <ToolbarGroup key={1} float="right">
          <RaisedButton
            label="Create"
            onTouchTap={() => {
              this._handleEventCreation(this.state.selectedRows);
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
            disabled={(this.state.selectedRows.length == 0)}
            onTouchTap={() => {
          this._handleEventConfirmation(this.state.selectedRows);
        }}
          />
        </ToolbarGroup>
      </Toolbar>
    )
  }

  _deleteEvent = () => {
    let events = this.props.listContainer.events.edges;
    let eventsToDelete = this.state.indexesMarkedForDeletion.map((index) => {
      return events[index].node.id
    })

    this.refs.eventDeletionHandler.send({
      listContainer: this.props.listContainer,
      eventIDs: eventsToDelete
    })
    this._handleDeleteModalRequestClose();
  }

  renderDeleteModal() {
    let standardActions = [
      { text: 'Cancel' },
      { text: 'Delete', onTouchTap: this._deleteEvent, ref: 'submit' }
    ];

    this._handleDeleteModalRequestClose = () => {
      if (this.state.activeEventIndex) {
        this.setState({
          showDeleteEventDialog: false,
          showEventPreview: true
        });
      }
      else {
        this.setState({
          showDeleteEventDialog: false
        });
      }
    }

    let numEvents = this.state.indexesMarkedForDeletion.length;
    let s = (numEvents > 1) ? 's.' : '.';
    let dialogTitle = 'You are about to delete ' + numEvents + ' event' + s;
    let textConfirm = (
      <div>
        <p>Type <span style={{color: BernieColors.red}}>DELETE</span> to confirm.</p>
        <TextField hintText="DELETE" underlineFocusStyle={{borderColor: BernieColors.red}} ref="deleteConfirmationInput" />
      </div>
    )
    if (numEvents < 5)
      textConfirm = <div></div>

    return (
      <Dialog
        title={dialogTitle}
        actions={standardActions}
        open={this.state.showDeleteEventDialog}
        onRequestClose={this._handleDeleteModalRequestClose}
      >
      {textConfirm}
      </Dialog>
    )
  }

  renderCreateModal() {
    let standardActions = [
      { text: 'Cancel' }
    ];

    this._handleCreateModalRequestClose = () => {
      this.setState({
        showCreateEventDialog: false
      });
    }

    return (
      <Dialog
        title='Create an Event'
        actions={standardActions}
        open={this.state.showCreateEventDialog}
        onRequestClose={this._handleCreateModalRequestClose}
        bodyStyle={{paddingBottom: '0'}}
      >
        <iframe
          ref="creationForm"
          src="create"
          style={{width: '100%', height: this.state.tableHeight*0.7, border: 'none'}}
        />
      </Dialog>
    )
  }

  renderEventPreviewModal(events) {

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
        label={(this.state.previewTabIndex == 0) ? 'Approve' : 'Update and Approve'}
        key="3"
        secondary={true}
        onTouchTap={() => {
          this._handleEventConfirmation([this.state.activeEventIndex]);
        }}
      />
    ];

    this._handlePreviewRequestClose = () => {
      this.setState({
        showEventPreview: false,
        activeEventIndex: null
      });
    }

    return (
      <Dialog
        actions={customActions}
        actionFocus="submit"
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
              if (!tab.props){return};
              this.setState({previewTabIndex: tab.props.tabIndex});
            }}
        >
          <Tab label="Preview" value={'0'} >
            <EventPreview
              eventsArray={events}
              eventIndex={this.state.activeEventIndex}
              onChangeEventIndex={(n) => {
              this._iterateActiveEvent(n);
            }}
              onEventConfirm={(indexArray) => {
              this._handleEventConfirmation(indexArray);
            }}
              onEventEdit={(modifiedEvent) => {
              this._handleEventEdit(modifiedEvent);
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
              event={events[this.state.activeEventIndex]}
              key={this.state.activeEventIndex}
            />
          </Tab>
        </Tabs>
      </Dialog>
    )
  }

  _handleRequestRefresh = () => {
    this.forceUpdate()
  }

  _handleEventPreviewOpen = (eventIndex, tabIndex) => {
    tabIndex = tabIndex ? tabIndex : 0;
    this.setState({
      showEventPreview: true,
      activeEventIndex: eventIndex,
      previewTabIndex: tabIndex
    });
  }

  _handlePublicEventOpen = (eventIndex) => {
    let events = this.props.listContainer.events.edges;
    window.open('https://secure.berniesanders.com/page/event/detail/' + events[eventIndex]['node']['eventIdObfuscated']);
  }

  _iterateActiveEvent = (n) => {
    // Do not iterate if there are no more events available before/after current event
    let events = this.props.listContainer.events.edges;
    if (this.state.activeEventIndex === null || this.state.activeEventIndex + n < 0 || this.state.activeEventIndex + n == events.length){
      return
    }
    this.setState({
      activeEventIndex: this.state.activeEventIndex + n
    });
  }

  _handleEventCreation = () => {
    this.setState({
      showCreateEventDialog: true
    });
  }

  _handleEventDeletion = (eventIndexes) => {
    this.setState({
      showEventPreview: false,
      showDeleteEventDialog: true,
      indexesMarkedForDeletion: eventIndexes
    });
    // this needs to be fixed
    // ReactDOM.findDOMNode(adminInterface.refs.deleteConfirmationInput).focus();
  }

  _handleEventConfirmation = (eventIndexes) => {
    this._iterateActiveEvent(1);
  }

  _handleEventEdit = (event) => {
    console.log(event);
    // adminInterface._iterateActiveEvent(1);
  }

  _handleEventSelect = (eventIndex) => {
    let currentSelectedRows = this.state.selectedRows;
    let i = currentSelectedRows.indexOf(eventIndex);
    if ( i > -1){
      currentSelectedRows.splice(i, 1);
    }
    else {
      currentSelectedRows.push(eventIndex);
    }
    this.setState({
      selectedRows: currentSelectedRows
    });
  }

  _handleRowClick = (clickEvent, targetRowIndex) => {
    this._handleEventPreviewOpen(targetRowIndex, 1);
  }

  _masterCheckBoxChecked = (checkEvent, checked) => {
    let currentSelectedRows = [];
    let events = this.props.listContainer.events.edges;

    if (checked){
      for (let i=0; i<events.length; i++){
        currentSelectedRows.push(i);
      }
    }
    this.setState({
      selectedRows: currentSelectedRows
    });
  }

  render() {
    let events = this.props.listContainer.events.edges;

    return (
    <div>
      <MutationHandler ref='eventDeletionHandler' successMessage='Event deleted!' mutationClass={DeleteEvents} />
      {this.renderDeleteModal()}
      {this.renderCreateModal()}
      {this.renderEventPreviewModal(events)}
      {this.renderToolbar()}
      <Table
        rowHeight={83}
        groupHeaderHeight={35}
        headerHeight={50}
        rowsCount={events.length}
        width={this.state.tableWidth}
        height={this.state.tableHeight}
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
            width={170}
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
            header={<this.HeaderCell content="Phone" />}
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
          header={<this.HeaderCell content="Time" />}>
          <Column
            header={<this.HeaderCell content="Datetime" />}
            cell={<this.DateCell data={events} col="startDate" />}
            flexGrow={1}
            width={170}
          />
          <Column
            header={<this.HeaderCell content="Duration" />}
            cell={<this.DurationCell data={events} col="duration" />}
            flexGrow={1}
            width={90}
          />
        </ColumnGroup>
        <ColumnGroup
          header={<this.HeaderCell content="Event Location" />}>
          <Column
            header={<this.HeaderCell content="Venue" />}
            cell={<this.TextCell data={events} col="venueName" />}
            flexGrow={1}
            width={150}
          />
          <Column
            header={<this.HeaderCell content="Address" />}
            cell={<this.TextCell data={events} col="venueAddr1" />}
            flexGrow={1}
            width={150}
          />
          <Column
            header={<this.HeaderCell content="City" />}
            cell={<this.TextCell data={events} col="venueCity" />}
            flexGrow={1}
            width={150}
          />
          <Column
            header={<this.HeaderCell content="State" />}
            cell={<this.TextCell data={events} col="venueState" />}
            flexGrow={1}
            width={60}
            align='center'
          />
          <Column
            header={<this.HeaderCell content="Zip Code" />}
            cell={<this.TextCell data={events} col="venueZip" />}
            flexGrow={1}
            width={120}
            align='center'
          />
        </ColumnGroup>
        <ColumnGroup
          header={<this.HeaderCell content="About" />}>
          <Column
            flexGrow={1}
            header={<this.HeaderCell content="Event Type" />}
            cell={
              <this.EventTypeCell data={events} col="eventType" />
            }
            width={100}
          />
          <Column
            flexGrow={1}
            header={<this.HeaderCell content="Event Name" />}
            cell={<this.TextCell data={events} col="name" />}
            width={250}
          />
          <Column
            flexGrow={1}
            header={<this.HeaderCell content="Description" />}
            cell={<this.TextCell data={events} col="description" />}
            width={250}
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
    sordDirection: 'ASC'
  },
  fragments: {
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        ${DeleteEvents.getFragment('listContainer')}
        events(first: $numEvents) {
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
              startDate
              duration
              capacity
              attendeeVolunteerShow
              attendeeVolunteerMessage
              isSearchable
              publicPhone
              contactPhone
              hostReceiveRsvpEmails
              rsvpUseReminderEmail
              rsvpReminderHours
            }
          }
        }
      }
    `,
  },
});