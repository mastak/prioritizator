import request from 'reqwest';

import AccountConstants from '../constants/Account';
import AccountStore from '../stores/Account';

import BaseAPI from './Base';


class AccountAPI extends BaseAPI {

  login (username, password) {
    return this.post({
      url: AccountConstants.LOGIN_URL,
      data: {
        username, password
      }
    });
  }

  loginSocial (code) {
    return this.post({
      url: AccountConstants.LOGIN_SOCIAL_URL,
      data: {
        code
      }
    });
  }

  logout () {
    return this.post({
      url: AccountConstants.LOGOUT_URL
    });
  }

}

export default new AccountAPI();
