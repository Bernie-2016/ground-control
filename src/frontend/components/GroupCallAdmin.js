import React from 'react';
import Relay from 'react-relay';
import GroupCallList from './GroupCallList';
import GroupCall from './GroupCall';
import GroupCallCreationForm from './GroupCallCreationForm';
import {RaisedButton} from 'material-ui';
import AdminSection from './AdminSection';

export class GroupCallAdmin extends React.Component {

  static propTypes = {
    navigateTo: React.PropTypes.func
  }

  componentWillReceiveProps(props) {
    let callId = props.path ? props.path.split('/')[0] : null
    this.props.relay.setVariables({callId: callId})
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  selectCall(callId) {
    this.props.navigateTo(callId)
  }

  selectCallCreation() {
    this.props.navigateTo('create')
  }

  render() {
    let contentView = <div></div>;
    if (this.props.relay.variables.callId === 'create')
      contentView = <GroupCallCreationForm viewer={this.props.viewer} />
    else if (this.props.relay.variables.callId)
      contentView = <GroupCall
        groupCall={this.props.viewer.groupCall} />

    let sideBar = (
      <div>
        <RaisedButton label="Create Calls"
          fullWidth={true}
          primary={true}
          onTouchTap={() => this.selectCallCreation()}
        />
        <GroupCallList
          groupCallList={this.props.viewer.upcomingCallList}
          subheader="Upcoming calls"
          onSelect={(id) => this.selectCall(id)}
        />
        <GroupCallList
          groupCallList={this.props.viewer.pastCallList}
          subheader="Past calls"
          onSelect={(id) => this.selectCall(id)}
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
  initialVariables: {
    callId: null,
  },

  prepareVariables: (prev) =>
  {
    if (prev.callId && prev.callId !== 'create')
      return {
        callId: prev.callId,
        fetchCall: true
      }
    else
      return {
        callId: '',
        fetchCall: false
      }
  },

  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        upcomingCallList:groupCallList(first:50, upcoming:true) {
          ${GroupCallList.getFragment('groupCallList')}
        }
        pastCallList:groupCallList(first:50, upcoming:false) {
          ${GroupCallList.getFragment('groupCallList')}
        }
        groupCall(id:$callId) @include(if: $fetchCall) {
          ${GroupCall.getFragment('groupCall')}
        }
        ${GroupCallCreationForm.getFragment('viewer')}
      }
    `,
  },
});