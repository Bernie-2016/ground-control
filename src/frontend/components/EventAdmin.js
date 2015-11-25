import React from 'react';
import Relay from 'react-relay';
import CallAssignmentList from './CallAssignmentList';
import SideBarLayout from './SideBarLayout';
import {RaisedButton} from 'material-ui';
import CallAssignment from './CallAssignment';
import CallAssignmentCreationForm from './CallAssignmentCreationForm';
import {BernieLayout} from './styles/bernie-css';

class EventAdmin extends React.Component {
  renderEvents() {
    return this.props.listContainer.eventList.edges.map((event) => {
      return <div>event.name</div>
    })
  }
  render() {
    return (
      <div>{this.renderEvents()}</div>
    )
  }
}

export default Relay.createContainer(EventAdmin, {
  fragments: {
    listContainer: () => Relay.QL`
      fragment on ListContainer {
        eventList(first:50) {
          edges {
            node {
              name
            }
          }
        }
      }
    `,
  },
});