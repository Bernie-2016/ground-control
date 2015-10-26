import 'babel/polyfill';
import createHashHistory from 'history/lib/createHashHistory'
import {Redirect, Route, Router} from 'react-router';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactRouterRelay from 'react-router-relay';
import Relay from 'react-relay';
import injectTapEventPlugin from "react-tap-event-plugin";
import App from './components/App';

injectTapEventPlugin();

const ViewerQueries = {
  viewer: () => Relay.QL`query { viewer }`
};



ReactDOM.render(
  <Router
    createElement={ReactRouterRelay.createElement}
    history={createHashHistory({queryKey: false})}
  >
    <Redirect from="/" to="/group-calls" />
    <Route path="/group-calls" component={App} queries={ViewerQueries}>
    </Route>
  </Router>,
  document.getElementById('root')
);
