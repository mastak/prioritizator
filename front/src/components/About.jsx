import React from 'react';

import AccountStore from '../stores/Account';


export default class About extends React.Component {
  render() {
    return (<h1>Hello {AccountStore.user ? AccountStore.user : ''}</h1>);
  }
};
