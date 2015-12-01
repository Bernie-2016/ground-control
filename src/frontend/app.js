import 'babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import {Redirect, IndexRoute, IndexRedirect, Route, Router} from 'react-router';
import ReactRouterRelay from 'react-router-relay';
import injectTapEventPlugin from 'react-tap-event-plugin';
import AdminDashboard from './components/AdminDashboard';
import AdminEventsSection from './components/AdminEventsSection';
import AdminCallAssignmentsSection from './components/AdminCallAssignmentsSection';
import AdminCallAssignmentCreationForm from './components/AdminCallAssignmentCreationForm';
import GCTextField from './components/forms/GCTextField';
import GCBooleanField from './components/forms/GCBooleanField';
import CallAssignmentsDashboard from './components/CallAssignmentsDashboard';
import AdminCallAssignment from './components/AdminCallAssignment';
import CallAssignment from './components/CallAssignment';
import CallAssignmentsSection from './components/CallAssignmentsSection';
import Dashboard from './components/Dashboard';
import Signup from './components/Signup';
import Form from 'react-formal';
import {createHistory} from 'history';

injectTapEventPlugin();

Form.addInputTypes({
  string: GCTextField,
  boolean: GCBooleanField
})

const ListContainerQueries = {
  listContainer: () => Relay.QL`query { listContainer }`
};

const CallAssignmentQueries = {
  callAssignment: () => Relay.QL`query { callAssignment(id: $id) }`
}

const CurrentUserQueries = {
  currentUser: () => Relay.QL`query { currentUser}`
}

const EventQueries = {
  eventList: () => Relay.QL`query { events }`
}

let history = createHistory()

ReactDOM.render(
  <Router
    history={history}
    createElement={ReactRouterRelay.createElement}>
    <Route
      path='/admin'
      component={AdminDashboard}>
      <Route
        path='call-assignments'
        component={AdminCallAssignmentsSection}
        queries={ListContainerQueries}
      >
        <Route
          path='create'
          component={AdminCallAssignmentCreationForm}
          queries={ListContainerQueries}
        />
        <Route
          path=':id'
          component={AdminCallAssignment}
          queries={CallAssignmentQueries}
        />
      </Route>
      <Route
        path='events'
        component={AdminEventsSection}
        queries={ListContainerQueries}
      />
    </Route>
    <Route
      path='/'
      component={Dashboard}>
      <IndexRedirect to='/call-assignments' />
      <Route
        path='call-assignments'
        component={CallAssignmentsDashboard}
      >
        <IndexRoute
          component={CallAssignmentsSection}
          queries={CurrentUserQueries}
        />
        <Route
          path=':id'
          component={CallAssignment}
          queries={CallAssignmentQueries}
        />
      </Route>
      <Route
        path='/signup'
        component={Signup}
      />
    </Route>
  </Router>,
  document.getElementById('root')
);
