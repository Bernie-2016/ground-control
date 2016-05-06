import React from 'react'
import {
  Table,
  TableHeaderColumn,
  TableRow,
  TableHeader,
  TableRowColumn,
  TableBody,
  TableFooter
} from 'material-ui'
import phoneFormatter from 'phone-formatter'

export default class EventRSVPTable extends React.Component {
  static propTypes = {
    attendees: React.PropTypes.array
  }

  static defaultProps = {
    attendees: []
  }

  renderPhoneLink = (phone) => (phone) ? <a href={`tel:${phone}`}>{phoneFormatter.format(phone, '(NNN) NNN-NNNN')}</a> : ''

  render() {
    return (
      <Table selectable={false} multiSelectable={false} style={{fontFamily: 'Roboto'}}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn>Name</TableHeaderColumn>
            <TableHeaderColumn>Email</TableHeaderColumn>
            <TableHeaderColumn>Phone</TableHeaderColumn>
            <TableHeaderColumn>City</TableHeaderColumn>
            <TableHeaderColumn>State</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {this.props.attendees.map((attendee, index) => {
            const address = attendee.address || {}
            return (
              <TableRow key={index}>
                <TableRowColumn>{attendee.firstName} {attendee.lastName}</TableRowColumn>
                <TableRowColumn>
                  <a href={`mailto:${attendee.email}`}>{attendee.email}</a>
                </TableRowColumn>
                <TableRowColumn>{this.renderPhoneLink(attendee.phone)}</TableRowColumn>
                <TableRowColumn>{address.city}</TableRowColumn>
                <TableRowColumn>{address.state}</TableRowColumn>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    )
  }
}