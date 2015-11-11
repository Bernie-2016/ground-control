import React from 'react';
import Relay from 'react-relay';
import GroupCallList from './GroupCallList';
import GroupCall from './GroupCall';
import GroupCallCreationForm from './GroupCallCreationForm';
import {RaisedButton} from 'material-ui';
import AdminSection from './AdminSection';
import AdminHelpers from './AdminHelpers';

export class GroupCallAdmin extends React.Component {
  static propTypes = {
    navigateTo: React.PropTypes.func
  }

  componentWillReceiveProps(props) {
    let id = props.path ? props.path.split('/')[0] : null
    this.props.relay.setVariables({id: id})
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  render() {
    let contentView = AdminHelpers.contentViewFromId(this.props.relay.variables.id,
      <GroupCallCreationForm viewer={this.props.viewer} />,
      <GroupCall groupCall={this.props.viewer.groupCall} />
    )

    let sideBar = (
      <div>
        <RaisedButton label="Create Calls"
          fullWidth={true}
          primary={true}
          onTouchTap={() => this.selectCreation()}
        />
        <GroupCallList
          groupCallList={this.props.viewer.upcomingCallList}
          subheader="Upcoming calls"
          onSelect={(id) => this.props.navigateTo(id)}
        />
        <GroupCallList
          groupCallList={this.props.viewer.pastCallList}
          subheader="Past calls"
          onSelect={(id) => this.props.navigateTo('create')}
        />
      </div>
    )

    return (
      <AdminSection
        sideBar={sideBar}
        content={contentView}
      />
    )
  }
}

export default Relay.createContainer(GroupCallAdmin, {
  initialVariables: { id: null },

  prepareVariables: (prev) => AdminHelpers.variablesFromId(prev.id),

  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        upcomingCallList:groupCallList(first:50, upcoming:true) {
          ${GroupCallList.getFragment('groupCallList')}
        }
        pastCallList:groupCallList(first:50, upcoming:false) {
          ${GroupCallList.getFragment('groupCallList')}
        }
        groupCall(id:$id) @include(if: $fetchItem) {
          ${GroupCall.getFragment('groupCall')}
        }
        ${GroupCallCreationForm.getFragment('viewer')}
      }
    `,
  },
});