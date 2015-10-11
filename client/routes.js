import ReactRouterRelay from 'react-router-relay';

ReactDOM.render((
  <Router history={history} createElement={ReactRouterRelay.createElement}>
    <Route
      path="/create_group_call_invitation"
      component={CreateGroupCallInvitation}
      queries={
        groupCallInvitation: () => Relay.QL`query { viewer(id: $groupCallInvitationId) }`
      }
      queryParams = {{groupCallInvitationId: "296cad38-957b-4010-88c7-0ce29f3b7d9a"}}
    />
  </Router>
), container);

