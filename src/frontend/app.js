import 'babel/polyfill';
import createHashHistory from 'history/lib/createHashHistory'
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import injectTapEventPlugin from 'react-tap-event-plugin';
import AdminDashboard from './components/AdminDashboard';
import Survey from './components/Survey';
import VolunteerDashboard from './components/VolunteerDashboard';
import {Router} from './components/TreeRouter'

injectTapEventPlugin();

class ViewerQueries extends Relay.Route {
  static queries = {
    viewer: () => Relay.QL`query { viewer }`,
  };
  static routeName = 'ViewerQueries';
}

let history = createHashHistory({queryKey: false});
let routes = [
  {
    path: '/admin/',
    component: AdminDashboard,
    queries: ViewerQueries
  },
]

ReactDOM.render(
  <Router
    history={history}
    routes={routes}
  />,
  document.getElementById('root')
);
