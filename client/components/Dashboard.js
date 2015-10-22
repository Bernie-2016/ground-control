import React from 'react';
import Relay from 'react-relay';
import {Tabs, Tab, Styles, Paper, AppBar, AppCanvas} from 'material-ui';

export class Dashboard extends React.Component {
  render() {
    let styles = {
      root: {
        backgroundColor: Styles.Colors.white,
        position: 'fixed',
        height: 70,
        top: 0,
        right: 0,
        zIndex: 4,
        width: '100%',
      },
      title : {
        color: Styles.Colors.grey900
      },
      container: {
        textAlign: 'right',
        bottom: 0,
      },
      tabs: {
        width: 200,
        bottom:0,
      },
      tab: {
        backgroundColor: Styles.Colors.white,
        color: Styles.Colors.grey900,
        height: 64,
      },
    };
    let bernieLogo = (
      <a href="/">
        <img src="http://www.bernie2016events.org/img/logo.png"  />
      </a>
    );

    return (
      <div>
        <Paper
          zDepth={1}
          rounded={false}
          style={styles.root}>
          {bernieLogo}
          Ground Control
          <div style={styles.container}>
            <Tabs
              style={styles.tabs}>
              <Tab
                value="1"
                label="GROUP CALLS"
                style={styles.tab} />
            </Tabs>
          </div>
        </Paper>
      </div>
    );
  }
}