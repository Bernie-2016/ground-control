import 'babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import {Redirect, IndexRoute, IndexRedirect, Route, Router} from 'react-router';
import ReactRouterRelay from 'react-router-relay';
import injectTapEventPlugin from 'react-tap-event-plugin';
import AdminDashboard from './components/AdminDashboard';
import CallAssignmentAdmin from './components/CallAssignmentAdmin';
import SurveyViewer from './components/SurveyViewer';
import Survey from './components/Survey';
import VolunteerDashboard from './components/VolunteerDashboard';
import VolunteerNavigation from './components/VolunteerNavigation';
import GCTextField from './components/forms/GCTextField';
import GCBooleanField from './components/forms/GCBooleanField';
import Introduction from './components/Introduction';
import CallAssignmentDashboard from './components/CallAssignmentDashboard';
import CallAssignment from './components/CallAssignment';
import CallAssignmentViewer from './components/CallAssignmentViewer';
import CallAssignmentCreationForm from './components/CallAssignmentCreationForm';
import CallAssignmentListViewer from './components/CallAssignmentListViewer';
import VolunteerEventsDashboard from './components/VolunteerEventsDashboard';
import EventViewer from './components/EventViewer';
import EventEditor from './components/EventEditor';
import EventAdmin from './components/EventAdmin';
import Form from 'react-formal';
import {createHistory} from 'history';
import Signup from './components/Signup';

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

const PersonQueries = {
  person: () => Relay.QL`query { person(email: $email, id: $id) }`
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
        component={CallAssignmentAdmin}
        queries={ListContainerQueries}
      >
        <Route
          path='create'
          component={CallAssignmentCreationForm}
          queries={ListContainerQueries}
        />
        <Route
          path=':id'
          component={CallAssignment}
          queries={CallAssignmentQueries}
        />
      </Route>
      <Route
        path='events'
        component={EventAdmin}
        queries={ListContainerQueries}
      />
    </Route>
    <Route
      path='/'
      component={VolunteerNavigation}>
      <IndexRedirect to='/call-assignments' />
      <Route
        path='call-assignments'
        component={CallAssignmentDashboard}
      >
        <IndexRoute
          component={CallAssignmentListViewer}
          queries={CurrentUserQueries}
        />
        <Route
          path=':id'
          component={CallAssignmentViewer}
          queries={CallAssignmentQueries}
        />
      </Route>
      <Route
        path='/signup'
        component={Signup} />
      <Route
        path='events'
        component={VolunteerEventsDashboard}
      >
        <Route
          path=':id'
          component={EventViewer}
        >
          <Route
            path='edit'
            component={EventEditor}
          />
        </Route>
      </Route>
    </Route>
  </Router>,
  document.getElementById('root')
);
