import React from 'react'
import Relay from 'react-relay'
import {List, ListItem, Styles} from 'material-ui'
import moment from 'moment'

export class PreviouslyContactedList extends React.Component {
  static propTypes = {
    subheader: React.PropTypes.string,
    onSelect: React.PropTypes.func
  }

  renderPeople() {
    return this.props.previouslyContacted.map(person => {
      let primaryText = `${person.firstname} ${person.lastname}`
      let secondaryText = "what a nice person"

      return (
        <ListItem
          key={person.id}
          primaryText={primaryText}
          secondaryText={secondaryText}
          onTouchTap={(e) => this.props.onSelect(node.id)}/>
        )
      }
    )
  }

  render() {
    return (
      <List subheader={this.props.subheader}>
        {this.renderPeople()}
      </List>
    )
  }
}

export default Relay.createContainer(PreviouslyContactedList, {
  fragments: {
    previousContacts: () => Relay.QL`
      fragment on Person {
        firstName
        lastName
      }
    `
  }
})

