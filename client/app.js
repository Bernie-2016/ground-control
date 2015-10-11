import 'babel/polyfill';

import App from './components/App';
import AppHomeRoute from './routes/AppHomeRoute';
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';

ReactDOM.render(
  <Relay.RootContainer
    Component={App}
    route={new AppHomeRoute({groupCallInvitationId: 'fda3567f-0d75-4c27-8777-8d28cd1402d1'})}
  />,
  document.getElementById('root')
);
