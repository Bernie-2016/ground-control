import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';

import App from './components/App';
import AppHomeRoute from './routes/AppHomeRoute';

ReactDOM.render(
  <Relay.RootContainer
    Component={App}
    route={new AppHomeRoute({groupCallInvitationId: "296cad38-957b-4010-88c7-0ce29f3b7d9a"})}
  />,
  document.getElementById('container')
);
