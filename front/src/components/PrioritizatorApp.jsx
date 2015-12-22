'use strict';

import React from 'react';
import { Route, RouteHandler, IndexLink, Link } from 'react-router';

import AccountStore from '../stores/Account'


function getAppState() {
  return {
    loggedIn: AccountStore.isLoggedIn()
  };
}

export default class PrioritizatorApp extends React.Component {
  constructor() {
    super();
    this.state = getAppState();
  }

  componentDidMount() {
    this.subscription = AccountStore.addListener(this._onUserChange.bind(this));
  }

  componentWillUnmount() {
    this.subscription.remove()
  }

  _onUserChange() {
    this.setState(getAppState());
  }

  render() {
    let loginButton;
    if ( this.state.loggedIn ) {
      loginButton =  <li><a href="" onClick={this.logout}>Logout</a></li>;
    }
    else {
      loginButton =  <li><Link to="login" activeClassName="active">Login</Link></li>
    }
    return (
      <div className="container">
        <nav className="navbar navbar-default">
          <div className="navbar-header">
            <IndexLink to="/" className="navbar-brand">Prioritization</IndexLink>
          </div>
          <ul className="nav navbar-nav">
            <li><Link to="categories" activeClassName="active">Categories</Link></li>
            <li><Link to="about" activeClassName="active">About</Link></li>
            {loginButton}
          </ul>
        </nav>
        {this.props.children}
      </div>
    );
  }

  logout(e) {
    e.preventDefault();
    AuthService.logout();
  }

}
