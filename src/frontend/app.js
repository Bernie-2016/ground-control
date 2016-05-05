import 'babel/polyfill'
import jQuery from 'jquery'
import React from 'react'
import ReactDOM from 'react-dom'
import Relay from 'react-relay'
import EventCreate from './components/EventCreate.js'
import DummyEventCreate from './components/DummyEventCreate.js'
import {Redirect, IndexRoute, IndexRedirect, Route, Router, browserHistory} from 'react-router'
import ReactRouterRelay from 'react-router-relay'
import injectTapEventPlugin from 'react-tap-event-plugin'
import AdminDashboard from './components/AdminDashboard'
import AdminEventEmailCreationForm from './components/AdminEventEmailCreationForm'
import AdminEventsSection from './components/AdminEventsSection'
import AdminEventUploadRsvps from './components/AdminEventUploadRsvps'
import ConstituentLookup from './components/ConstituentLookup'
import AdminCallAssignmentsSection from './components/AdminCallAssignmentsSection'
import AdminCallAssignmentCreationForm from './components/AdminCallAssignmentCreationForm'
import FastFwdForm from './components/FastFwdForm'
import EventsDashboard from './components/EventsDashboard'
import EventView from './components/EventView'
import EventDataUpload from './components/EventDataUpload'
import GCTextField from './components/forms/GCTextField'
import GCRichTextField from './components/forms/GCRichTextField'
import GCPhoneField from './components/forms/GCPhoneField'
import GCDateField from './components/forms/GCDateField'
import GCDateTimeField from './components/forms/GCDateTimeField'
import GCTimeField from './components/forms/GCTimeField'
import GCPasswordField from './components/forms/GCPasswordField'
import GCRadioButtonsField from './components/forms/GCRadioButtonsField'
import GCSelectField from './components/forms/GCSelectField'
import GCCheckboxesField from './components/forms/GCCheckboxesField'
import GCBooleanField from './components/forms/GCBooleanField'
import GCToggleField from './components/forms/GCToggleField'
import CallAssignmentsDashboard from './components/CallAssignmentsDashboard'
import AdminCallAssignment from './components/AdminCallAssignment'
import CallAssignment from './components/CallAssignment'
import CallAssignmentsSection from './components/CallAssignmentsSection'
import Dashboard from './components/Dashboard'
import Signup from './components/Signup'
import NotFound from './components/NotFound'
import Unauthorized from './components/Unauthorized'
import Form from 'react-formal'
import GCNetworkLayer from './relay-extensions/GCNetworkLayer'
import log from './log'
import Loading from './components/Loading'
import SlackInviteIndex from './components/SlackInviteIndex';
import SlackInvite from './components/SlackInvite';
import UserAccountDashboard from './components/UserAccountDashboard'
import UserAccountChangePasswordForm from './components/UserAccountChangePasswordForm'

window.jQuery = jQuery
window.log = log

window.onerror = (msg, file, line, col, error) => {
  if (!error) {
    log.error('Uncaught exception with null error object')
    return
  }

  log.error(error)

  if (window.location.href.split('/')[2].split(':')[0] !== 'localhost')
    setTimeout(() => {
      alert('Whoops! Something went wrong. We\'re looking into it, but in the meantime please refresh your browser.')
      document.location.reload(true)
    }, 2000)
}

injectTapEventPlugin()
Relay.injectNetworkLayer(new GCNetworkLayer('/graphql'), {
  fetchTimeout: 30000,   // Timeout after 30s.
})

Form.addInputTypes({
  string: GCTextField,
  richtext: GCRichTextField,
  number: GCTextField,
  email: GCTextField,
  boolean: GCBooleanField,
  radio: GCRadioButtonsField,
  select: GCSelectField,
  array: GCCheckboxesField,
  password: GCPasswordField,
  date: GCDateField,
  time: GCTimeField,
  datetime: GCDateTimeField,
  phone: GCPhoneField
})

const ListContainerQueries = {
  listContainer: () => Relay.QL`query { listContainer }`
}

const CallAssignmentQueries = {
  callAssignment: () => Relay.QL`query { callAssignment(id: $id) }`
}

const CurrentUserQueries = {
  currentUser: () => Relay.QL`query { currentUser }`
}

const EventQueries = {
  event: () => Relay.QL`query { event(id: $id) }`
}

const FastFwdRequest = {
  fastFwdRequest: () => Relay.QL`query{ fastFwdRequest(id: $id) }`
}

ReactDOM.render(
  <Router
    history={browserHistory}
    createElement={ReactRouterRelay.createElement}>
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
        <IndexRoute
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
        path='events/:id/emails/create'
        component={AdminEventEmailCreationForm}
        queries={{
          ...ListContainerQueries,
          ...EventQueries,
          ...CurrentUserQueries
        }}
        renderLoading={() => <Loading />}
      />
      <Route
        path='events/upload-rsvps'
        component={AdminEventUploadRsvps}
      />

      <Route
        path='events'
        component={AdminEventsSection}
        queries={{
          ...CurrentUserQueries,
          ...ListContainerQueries
        }}
        renderLoading={() => <Loading />}
      />
      <Route
        path='constituent-lookup'
        component={ConstituentLookup}
        queries={{
          ...ListContainerQueries
        }}
        renderLoading={() => <Loading />}
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
      <IndexRedirect to='/events' />
      <Route
        path='events/create/v2'
        component={EventCreate}
        queries={CurrentUserQueries}
        renderLoading={() => <Loading />}
      />
      <Route
        path='events/create'
        component={DummyEventCreate}
        renderLoading={() => window.location.reload() }
      />
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
          renderLoading={() => <Loading />}
        />
      </Route>
      <Route
        path='events'
        component={CallAssignmentsDashboard}
        queries={CurrentUserQueries}
      >
        <IndexRoute
          component={EventsDashboard}
          queries={{
        		...CurrentUserQueries,
        	}}
        />
        <Route
          path=':id'
          component={EventView}
          queries={{
            ...EventQueries,
            ...CurrentUserQueries
          }}
          renderLoading={() => <Loading />}
        />
        {/*<Route
          path=':id/upload'
          component={EventDataUpload}
          queries={{
            ...EventQueries,
            ...ListContainerQueries,
            ...CurrentUserQueries
          }}
          renderLoading={() => <Loading />}
        />*/}
        <Route
          path=':id/request-email'
          component={FastFwdForm}
            queries={{
              ...EventQueries,
              ...CurrentUserQueries
            }}
            renderLoading={() => <Loading />}
        />
      </Route>
      <Route
        path='account'
        component={UserAccountDashboard}
        queries={CurrentUserQueries}
      >
        <IndexRoute
          component={UserAccountChangePasswordForm}
        />
      </Route>
    </Route>
    <Route
      path='slack'
    >
      <IndexRoute
        component={SlackInviteIndex}
      />
      <Route
        path=':team'
        component={SlackInvite}
        renderLoading={() => <Loading />}
      />
    </Route>
    <Route path='/unauthorized' component={Unauthorized}/>
    <Route path="*" component={NotFound}/>
  </Router>,
  document.getElementById('root')
)
