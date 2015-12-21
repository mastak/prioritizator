import React from 'react';
import { render } from 'react-dom'
import { Router, Route } from 'react-router'
import createBrowserHistory from 'history/lib/createBrowserHistory'

import Main from './components/Main'

//import Category from './components/Category';
import Login from './components/Login';
//import Logout from './components/Logout';
//import About from './components/About';

import RouterContainer from './services/RouterContainer';
import LoginActions from './actions/LoginActions';


function requireAuth(nextState, replaceState) {
  if (!auth.loggedIn())
    replaceState({ nextPathname: nextState.location.pathname }, '/login')
}


//RouterContainer.set((
//  <Router history={browserHistory}>
//    <Route path="/" component={App}>
//      <Route path="category" component={Category} onEnter={requireAuth} />
//      <Route path="login" component={Login} />
//      <Route path="logout" component={Logout} />
//      <Route path="about" component={About} />
//    </Route>
//  </Router>
//));

RouterContainer.set((
  <Router history={createBrowserHistory()}>
    <Route path="/" component={Main}>
      <Route path="login" component={Login} />
    </Route>
  </Router>
));
render(RouterContainer.get(), document.getElementById('content'));
