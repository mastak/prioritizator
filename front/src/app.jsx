import React from 'react';
import { render } from 'react-dom'
import { Router, Route } from 'react-router'
import createBrowserHistory from 'history/lib/createBrowserHistory'

import AccountActions from './actions/Account'
import AccountStore from './stores/Account';
import AppDispatcher from './dispatchers/AppDispatcher';
import RouterContainer from './libs/RouterContainer';

import PrioritizatorApp from './components/PrioritizatorApp'
import About from './components/About';
import Category from './components/Category';
import Login from './components/Login';


function requireAuth(nextState, replaceState) {
  if (!AccountStore.isLoggedIn())
    replaceState({ nextPath: nextState.location.pathname }, '/login')
}

AccountActions.setAccount();

RouterContainer.set((
  <Router history={createBrowserHistory()}>
    <Route path="/" component={PrioritizatorApp}>
      <Route path="category" component={Category} onEnter={requireAuth} />
      <Route path="about" component={About} />
      <Route path="login" component={Login} />
    </Route>
  </Router>
));
render(RouterContainer.get(), document.getElementById('content'));
