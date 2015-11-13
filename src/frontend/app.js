import 'babel/polyfill';
import createHashHistory from 'history/lib/createHashHistory'
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
import Form from 'react-formal';

injectTapEventPlugin();

Form.addInputTypes({
  string: GCTextField,
})

const ViewerQueries = {
  viewer: () => Relay.QL`query { viewer }`
};

ReactDOM.render(
  <Router
    createElement={ReactRouterRelay.createElement}
    history={createHashHistory({queryKey: false})} >
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
        path="surveys(/:id)"
        component={SurveyViewer}
        queries={ViewerQueries}
      />
    </Route>
  </Router>,
  document.getElementById('root')
);
