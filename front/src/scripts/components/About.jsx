import React from 'react';

import AccountStore from '../stores/Account';


export default class About extends React.Component {
  render() {
    return (
      <article>
        <h1>Hello {AccountStore.user ? AccountStore.user : ''}</h1>
        <p>It is web app for prioritization</p>
      </article>);
  }
};
