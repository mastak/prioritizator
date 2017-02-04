import jwt_decode from 'jwt-decode';
import { Store } from 'flux/utils';
//import hellojs from 'hellojs';

import hellojs from '../libs/social/main'

import AccountActions from '../actions/Account'
import AccountConstants from '../constants/Account';
import AppDispatcher from '../dispatchers/AppDispatcher';
import CommonConstants from '../constants/Common';


class AccountStore extends Store {

    constructor(dispatcher) {
        super(dispatcher);
        this._user = null;
        this._jwt = null;
    }

    __onDispatch(action) {
        switch(action.type) {
            case CommonConstants.PAGE_INIT:
                AccountActions.setAccount();
                hellojs.init({
                    facebook: 696305753837490
                }); // TODO:
                hellojs.on('auth.login', AccountActions.loginSocialCallback.bind(AccountActions));
                this.__emitChange();
                break;
            //case AccountConstants.SOCIAL_AUTH_CALLBACK:
            //    auth = action.auth;
            //
            //    break;
            case AccountConstants.LOGIN_PROCESS:
                this._jwt = action.jwt;
                this._user = jwt_decode(this._jwt);
                this.__emitChange();
                break;
            case AccountConstants.LOGOUT_PROCESS:
                this._user = this._jwt = null;
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
