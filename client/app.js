import 'babel/polyfill';
import createHashHistory from 'history/lib/createHashHistory'
import {IndexRoute, Route, Router} from 'react-router';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactRouterRelay from 'react-router-relay';
import Relay from 'react-relay';
import CreateGroupCallInvitationForm from './components/CreateGroupCallInvitationForm'

const GroupCallInvitationQueries = {
  groupCallInvitation: () => Relay.QL`
    query {
      groupCallInvitation(id: $groupCallInvitationId)
    }`,
};
ReactDOM.render(
  <Router
    createElement={ReactRouterRelay.createElement}
    history={createHashHistory({queryKey: false})}
  >
    <Route
      path="/" component={CreateGroupCallInvitationForm}
      queries={GroupCallInvitationQueries}
    >
      <Route
        path=":groupCallInvitationId"
        component={CreateGroupCallInvitationForm}
        queries={GroupCallInvitationQueries}
      />
    </Route>
  </Router>,
  document.getElementById('root')
);
