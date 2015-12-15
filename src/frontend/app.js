import 'babel/polyfill';
import jQuery from 'jquery';
import Minilog from 'minilog';
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
import GCPasswordField from './components/forms/GCPasswordField';
import GCRadioButtonsField from './components/forms/GCRadioButtonsField';
import GCSelectField from './components/forms/GCSelectField';
import GCCheckboxesField from './components/forms/GCCheckboxesField';
import GCBooleanField from './components/forms/GCBooleanField';
import CallAssignmentsDashboard from './components/CallAssignmentsDashboard';
import AdminCallAssignment from './components/AdminCallAssignment';
import CallAssignment from './components/CallAssignment';
import CallAssignmentsSection from './components/CallAssignmentsSection';
import Dashboard from './components/Dashboard';
import ResetPassword from './components/ResetPassword';
import PasswordResetForm from './components/PasswordResetForm';
import Signup from './components/Signup';
import NotFound from './components/NotFound'
import Form from 'react-formal';
import {createHistory} from 'history';
import RelayNetworkLayer from './RelayNetworkLayer'
import StackTrace from 'stacktrace-js';

// Necessary to make minilog work
window.jQuery = jQuery;
Minilog
  .enable()
  .pipe(new Minilog.backends.jQuery({
    url: '/log',
    interval: 1000
    }));
window.log = Minilog('client');

window.onerror = (msg, file, line, col, error) => {
    StackTrace
      .fromError(error)
      .then((stack) => {
        log.error('Uncaught exception!', stack);
        setTimeout(() => {
            alert('Whoops! Something went wrong. We\'re looking into it, but in the meantime please refresh your browser.');
            document.location.reload(true);
        }, 2000);
      })
      .catch((stack) => {
        log.error(stack);
      });
};

injectTapEventPlugin();
Relay.injectNetworkLayer(new RelayNetworkLayer('/graphql'));

Form.addInputTypes({
  string: GCTextField,
  number: GCTextField,
  boolean: GCBooleanField,
  radio: GCRadioButtonsField,
  select: GCSelectField,
  array: GCCheckboxesField,
  password: GCPasswordField
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

let history = createHistory()

ReactDOM.render(
  <Router
    history={history}
    createElement={ReactRouterRelay.createElement}>
    <Route
      path='/password_reset'
      component={ResetPassword}
    />
    <Route
      path='/password_reset/:token'
      component={PasswordResetForm}
    />
    <Route
      path='/admin'
      component={AdminDashboard}
      queries={ListContainerQueries}
    >
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
      path='/signup'
      component={Signup}
    />
    <Route
      path='/'
      component={Dashboard}
      queries={CurrentUserQueries}
      >
      <IndexRedirect to='/call' />
      <Route
        path='call'
        component={CallAssignmentsDashboard}
        queries={CurrentUserQueries}
      >
        <IndexRoute
          component={CallAssignmentsSection}
          queries={CurrentUserQueries}
        />
        <Route
          path=':id'
          component={CallAssignment}
          queries={{
            ...CallAssignmentQueries,
            ...CurrentUserQueries
          }}
        />
      </Route>
    </Route>
    <Route path="*" component={NotFound} />
  </Router>,
  document.getElementById('root')
);
