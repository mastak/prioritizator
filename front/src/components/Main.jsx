'use strict';

import React from 'react';
import LoginStore from '../stores/LoginStore'
import { Route, RouteHandler, IndexLink, Link } from 'react-router';
import AuthService from '../services/AuthService'

export default class Main extends React.Component {
  constructor() {
    super();
    this.state = this._getState();
  }

  _getState() {
    return {
      loggedIn: LoginStore.isLoggedIn()
    };
  }

  componentWillMount() {
    let jwt = localStorage.getItem('jwt');
    if (jwt) {
      LoginActions.loginUser(jwt);
    }
  }

  componentDidMount() {
    this.changeListener = this._onUserChange.bind(this);
    LoginStore.addChangeListener(this.changeListener);
  }

  componentWillUnmount() {
    LoginStore.removeChangeListener(this.changeListener);
  }

  _onUserChange() {
    this.setState(this._getState());
  }

  render() {
    return (
      <div className="container">
        <nav className="navbar navbar-default">
          <div className="navbar-header">
            <IndexLink to="/" className="navbar-brand">Prioritization</IndexLink>
          </div>
          <ul className="nav navbar-nav">
            <li>
              <Link to="categories" activeClassName="active">Categories</Link>
            </li>
            <li>
              <Link to="logout" activeClassName="active">Logout</Link>
            </li>
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
