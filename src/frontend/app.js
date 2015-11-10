import 'babel/polyfill';
import createHashHistory from 'history/lib/createHashHistory'
import {Redirect, Route, Router, IndexRedirect} from 'react-router';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactRouterRelay from 'react-router-relay';
import Relay from 'react-relay';
import injectTapEventPlugin from 'react-tap-event-plugin';
import AdminDashboard from './components/AdminDashboard';

import Survey from './components/Survey';
import VolunteerDashboard from './components/VolunteerDashboard';

injectTapEventPlugin();

const ViewerQueries = {
  viewer: () => Relay.QL`query { viewer }`
};

ReactDOM.render(
  <Router
    createElement={ReactRouterRelay.createElement}
    history={createHashHistory({queryKey: false})} >
    <Route
      path="/admin(/**)"
      component={AdminDashboard}
      queries={ViewerQueries}
    />
    <Route
      path="/"
      component={VolunteerDashboard} >
      <Route
        path="surveys/:id"
        component={Survey}
        queries={ViewerQueries} />
    </Route>
  </Router>,
  document.getElementById('root')
);
