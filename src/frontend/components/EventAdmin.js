import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import CallAssignmentList from './CallAssignmentList';
import SideBarLayout from './SideBarLayout';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle, DropDownMenu, DropDownIcon, RaisedButton, Dialog, TextField, Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui';
import CallAssignment from './CallAssignment';
import CallAssignmentCreationForm from './CallAssignmentCreationForm';
import {BernieLayout, BernieColors} from './styles/bernie-css';

class EventAdmin extends React.Component {
  constructor() {
    super();
    this.setState = this.setState.bind(this);
    this.state = {
      cursor: null,
      showDeleteEventDialog: false,
      noEventSelected: true,
      filterOptionsIndex: 1,
      fixedHeader: true,
      fixedFooter: true,
      stripedRows: false,
      showRowHover: false,
      selectable: true,
      multiSelectable: true,
      enableSelectAll: true,
      deselectOnClickaway: false,
      height: '470px',
    };
  }

  renderEvents() {
    console.log(this.props.listContainer.eventList);
    return this.props.listContainer.eventList.edges.map((edge) => {
      return (
        <TableRow key={edge.node.id}>
          <TableRowColumn>{edge.node.eventIdObfuscated}</TableRowColumn>
          <TableRowColumn>{edge.node.creatorConsId}</TableRowColumn>
          <TableRowColumn>{edge.node.name}</TableRowColumn>
          <TableRowColumn>{edge.node.venueAddr1} {edge.node.venueCity}</TableRowColumn>
          <TableRowColumn>{edge.node.venueZip}</TableRowColumn>
          <TableRowColumn>{edge.node.venueState}</TableRowColumn>
          <TableRowColumn><RaisedButton label="Preview" primary={false} /></TableRowColumn>
        </TableRow>
      )
    })
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
          <RaisedButton label="Refresh" secondary={true} />
          <ToolbarSeparator/>
          <RaisedButton
            label="Delete"
            primary={false}
            disabled={this.state.noEventSelected}
            onTouchTap={this._onDeleteClick}
          />
          <RaisedButton label="Approve Selected" primary={true} disabled={this.state.noEventSelected} />
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

  render() {
    this._onRowSelection = (selectedRows) => {
      this.setState({
        noEventSelected: (selectedRows == 'none' || selectedRows.length == 0)
      });
    }

    return (
    <div>
      {this.renderDeleteModal()}
      {this.renderToolbar()}
      <Table
        height={this.state.height}
        fixedHeader={this.state.fixedHeader}
        fixedFooter={this.state.fixedFooter}
        selectable={this.state.selectable}
        multiSelectable={this.state.multiSelectable}
        onRowSelection={this._onRowSelection}>
        <TableHeader enableSelectAll={this.state.enableSelectAll}>
          <TableRow>
            <TableHeaderColumn tooltip='BSD Obfuscated Event ID'>Obfuscated ID</TableHeaderColumn>
            <TableHeaderColumn tooltip='Creator Constituent ID'>Event Host</TableHeaderColumn>
            <TableHeaderColumn tooltip='Event Name'>Name</TableHeaderColumn>
            <TableHeaderColumn tooltip='Event Address'>Address</TableHeaderColumn>
            <TableHeaderColumn tooltip='Zip Code'>Zip</TableHeaderColumn>
            <TableHeaderColumn tooltip='State'>State</TableHeaderColumn>
            <TableHeaderColumn tooltip='Actions'>Actions</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody
          deselectOnClickaway={this.state.deselectOnClickaway}
          showRowHover={this.state.showRowHover}
          stripedRows={this.state.stripedRows}>
        {this.renderEvents()}
        </TableBody>
        <TableFooter>
            <TableRow>
              <TableRowColumn colSpan="7" style={{textAlign: 'center'}}>
                {this.props.listContainer.eventList.edges[this.props.listContainer.eventList.edges.length-1].cursor}
              </TableRowColumn>
            </TableRow>
        </TableFooter>
      </Table>
    </div>
    )
  }
}

export default Relay.createContainer(EventAdmin, {
  fragments: {
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        eventList(first: 20) {
          edges {
            cursor
            node {
              name
              id
              BSDId
              eventIdObfuscated
              flagApproval
              eventTypeId
              creatorConsId
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