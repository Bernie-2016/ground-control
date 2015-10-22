import React from 'react';
import Relay from 'react-relay';
import {Navbar, NavBrand, Nav, NavItem} from 'react-bootstrap';

export class Dashboard extends React.Component {
  render() {
    return (
      <div className="container-fluid">
        <Navbar inverse toggleNavKey={0}>
          <NavBrand>
            <a href="/">
              <img className="logo" src="https://berniesanders.com/wp-content/themes/berniesanders2016/images/icns/sanders-logo.svg#logo" />
            </a>
          </NavBrand>
          <p className='navbar-text h3' left>Ground Control</p>
          <Nav right>
            <NavItem href="/#/group-calls">Group Calls</NavItem>
          </Nav>
        </Navbar>
        {this.props.children}
      </div>
    );
  }
}