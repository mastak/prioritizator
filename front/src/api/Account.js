import request from 'reqwest';

import AccountConstants from '../constants/Account';
import AccountStore from '../stores/Account';

import BaseAPI from './Base';


export default class AccountAPI extends BaseAPI {

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
