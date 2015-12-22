import jwt_decode from 'jwt-decode';
import { Store } from 'flux/utils';

import AccountConstants from '../constants/Account';
import AppDispatcher from '../dispatchers/AppDispatcher';


class AccountStore extends Store {

  constructor(dispatcher) {
    super(dispatcher);
    this._user = null;
    this._jwt = null;
  }

  __onDispatch(action) {
    switch(action.type) {
      case AccountConstants.LOGIN_PROCESS:
        this._jwt = action.jwt;
        this._user = jwt_decode(this._jwt);
        this.__emitChange();
        break;
      case AccountConstants.LOGOUT_PROCESS:
        this._user = this._jwt =  null;
        this.__emitChange();
        break;
      default:
        break;
    }
  }

  get user() {
    return this._user;
  }

  get jwt() {
    return this._jwt;
  }

  isLoggedIn() {
    return !!this._user;
  }
}

export default new AccountStore(AppDispatcher);
