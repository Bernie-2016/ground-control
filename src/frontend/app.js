import 'babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import {Redirect, Route, Router, IndexRedirect} from 'react-router';
import ReactRouterRelay from 'react-router-relay';
import injectTapEventPlugin from 'react-tap-event-plugin';
import AdminDashboard from './components/AdminDashboard';
import GroupCallAdmin from './components/GroupCallAdmin';
import CallAssignmentAdmin from './components/CallAssignmentAdmin';
import SurveyViewer from './components/SurveyViewer';
import Survey from './components/Survey';
import VolunteerDashboard from './components/VolunteerDashboard';
import GCTextField from './components/forms/GCTextField';
import Introduction from './components/Introduction';
import Form from 'react-formal';
import {createHistory} from 'history';

injectTapEventPlugin();

Form.addInputTypes({
  string: GCTextField,
})

const ViewerQueries = {
  viewer: () => Relay.QL`query { viewer }`
};

let history = createHistory()

ReactDOM.render(
  <Router
    history={history}
    createElement={ReactRouterRelay.createElement}>
    <Route
      path="/admin"
      component={AdminDashboard}>
      <Route
        path="group-calls(/:id)"
        component={GroupCallAdmin}
        queries={ViewerQueries}
      />
      <Route
        path="call-assignments(/:id)"
        component={CallAssignmentAdmin}
        queries={ViewerQueries}
      />
    </Route>
    <Route
      path="/"
      component={VolunteerDashboard}>
      <Route
        path="/get-started"
        component={Introduction}
      />
      <Route
        path="surveys(/:id)"
        component={SurveyViewer}
        queries={ViewerQueries}
      />
    </Route>
  </Router>,
  document.getElementById('root')
);
