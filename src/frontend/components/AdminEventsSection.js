import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import CallAssignmentList from './CallAssignmentList';
import SideBarLayout from './SideBarLayout';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle, DropDownMenu, DropDownIcon, Dialog, RaisedButton, Checkbox, TextField} from 'material-ui';
import {Table, Column, ColumnGroup, Cell} from 'fixed-data-table';
import CallAssignment from './CallAssignment';
import {BernieColors} from './styles/bernie-css';

class AdminEventSection extends React.Component {
  constructor() {
    super();
    this.setState = this.setState.bind(this);
    this.state = {
      cursor: null,
      showDeleteEventDialog: false,
      noEventSelected: true,
      filterOptionsIndex: 1,
      tableWidth: 1280,
      tableHeight: 600,
      selectedRows: []
    };
  }

  renderToolbar() {
    let filterOptions = [
      { payload: '1', text: 'All Events' },
      { payload: '2', text: 'Pending Approval' },
      { payload: '3', text: 'Approved Events' },
      { payload: '4', text: 'Past Events' }
    ];

    this._onDeleteClick = () => {
      this.setState({
        showDeleteEventDialog: true
      });
      ReactDOM.findDOMNode(this.refs.deleteConfirmationInput).focus();
    }

    return (
      <Toolbar>
        <ToolbarGroup key={0} float="left">
          <DropDownMenu menuItems={filterOptions} selectedIndex={this.state.filterOptionsIndex} />
        </ToolbarGroup>
        <ToolbarGroup key={1} float="right">
          <RaisedButton label="Refresh" primary={false} />
          <ToolbarSeparator/>
          <RaisedButton
            label="Delete"
            primary={true}
            disabled={this.state.noEventSelected}
            onTouchTap={this._onDeleteClick}
          />
          <RaisedButton label="Approve Selected" secondary={true} disabled={this.state.noEventSelected} />
        </ToolbarGroup>
      </Toolbar>
    )
  }

  renderDeleteModal() {
    let standardActions = [
      { text: 'Cancel' },
      { text: 'Delete', onTouchTap: this._onDialogSubmit, ref: 'submit' }
    ];

    this._handleRequestClose = () => {
      this.setState({
        showDeleteEventDialog: false
      });
    }

    return (
      <Dialog
        title="Are you sure?"
        actions={standardActions}
        actionFocus="submit"
        open={this.state.showDeleteEventDialog}
        onRequestClose={this._handleRequestClose}
      >
        <p>Type <span style={{color: BernieColors.red}}>DELETE</span> to confirm.</p>
        <TextField hintText="DELETE" underlineFocusStyle={{borderColor: BernieColors.red}} ref="deleteConfirmationInput" />
      </Dialog>
    )
  }

  SelectCell = ({rowIndex, data, col, ...props}) => (
    <Cell {...props}>
      <Checkbox
        name="checkboxName1"
        value="checkboxValue1"
        checked={this.state.selectedRows.indexOf(rowIndex) > -1}
      />
    </Cell>
  );

  TextCell = ({rowIndex, data, col, ...props}) => (
    <Cell {...props}>
      {data[rowIndex]['node'][col]}
    </Cell>
  );

  ActionCell = ({rowIndex, data, col, ...props}) => (
    <Cell {...props}>
      <RaisedButton label="Preview" primary={false} />
    </Cell>
  );

  render() {

    this._handleRowClick = (clickEvent, targetRowIndex) => {
      let currentSelectedRows = this.state.selectedRows;
      let i = currentSelectedRows.indexOf(targetRowIndex);
      if ( i > -1){
        currentSelectedRows.splice(i, 1);
      }
      else {
        currentSelectedRows.push(targetRowIndex);
      }
      this.setState({
        selectedRows: currentSelectedRows,
        noEventSelected: (currentSelectedRows.length == 0)
      });
    }

    this._masterCheckBoxChecked = (checkEvent, checked) => {
      let currentSelectedRows = [];

      if (checked){
        for (let i=0; i<events.length; i++){
          currentSelectedRows.push(i);
        }
      }
      this.setState({
        selectedRows: currentSelectedRows,
        noEventSelected: (currentSelectedRows.length == 0)
      });
    }

    let events = this.props.listContainer.events.edges;
    return (
    <div>
      {this.renderDeleteModal()}
      {this.renderToolbar()}
      <Table
        rowHeight={50}
        groupHeaderHeight={30}
        headerHeight={50}
        rowsCount={events.length}
        width={this.state.tableWidth}
        height={this.state.tableHeight}
        onRowClick={this._handleRowClick}
        {...this.props}>
        <ColumnGroup
          fixed={true}
          header={<Cell>Actions</Cell>}>
          <Column
            header={
              <Cell>
                <Checkbox
                  name="checkboxName1"
                  value="checkboxValue1"
                  onCheck={this._masterCheckBoxChecked}
                />
              </Cell>
            }
            cell={<this.SelectCell data={events} col="actions" />}
            fixed={true}
            width={43}
          />
          <Column
            header={<Cell>Manage</Cell>}
            cell={<this.ActionCell data={events} col="actions" />}
            fixed={true}
            width={120}
            align='center'
          />
        </ColumnGroup>
        <ColumnGroup
          header={<Cell>About</Cell>}>
          <Column
            flexGrow={1}
            header={<Cell>Event Name</Cell>}
            cell={<this.TextCell data={events} col="name" />}
            width={250}
          />
          <Column
            flexGrow={1}
            header={<Cell>Description</Cell>}
            cell={<this.TextCell data={events} col="description" />}
            width={250}
          />
        </ColumnGroup>
        <ColumnGroup
          header={<Cell>Time</Cell>}>
          <Column
            header={<Cell>DateTime</Cell>}
            cell={<this.TextCell data={events} col="startDate" />}
            flexGrow={1}
            width={190}
          />
          <Column
            header={<Cell>Duration</Cell>}
            cell={<this.TextCell data={events} col="duration" />}
            flexGrow={1}
            width={100}
          />
        </ColumnGroup>
        <ColumnGroup
          header={<Cell>Event Location</Cell>}>
          <Column
            header={<Cell>Venue</Cell>}
            cell={<this.TextCell data={events} col="venueName" />}
            flexGrow={1}
            width={150}
          />
          <Column
            header={<Cell>Address</Cell>}
            cell={<this.TextCell data={events} col="venueAddr1" />}
            flexGrow={1}
            width={150}
          />
          <Column
            header={<Cell>City</Cell>}
            cell={<this.TextCell data={events} col="venueCity" />}
            flexGrow={1}
            width={150}
          />
          <Column
            header={<Cell>State</Cell>}
            cell={<this.TextCell data={events} col="venueState" />}
            flexGrow={1}
            width={60}
            align='center'
          />
          <Column
            header={<Cell>Zip</Cell>}
            cell={<this.TextCell data={events} col="venueZip" />}
            flexGrow={1}
            width={120}
            align='center'
          />
        </ColumnGroup>
      </Table>
    </div>
    )
  }
}

export default Relay.createContainer(AdminEventSection, {
  fragments: {
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        events(first: 20) {
          edges {
            cursor
            node {
              name
              id
              eventIdObfuscated
              flagApproval
              eventTypeId
              description
              venueName
              venueZip
              venueCity
              venueState
              venueAddr1
              venueAddr2
              venueCountry
              venueDirections
              localTimezone
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