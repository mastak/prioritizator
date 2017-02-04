
import hellojs from '../libs/social/main'

import AccountConstants from '../constants/Account';
import AccountAPI from '../api/Account';
import AppDispatcher from '../dispatchers/AppDispatcher';
import RouterContainer from '../libs/RouterContainer'


class AccountAction {
    login(username, password) {
        return this.logins(AccountAPI.login.bind(AccountAPI), username, password);
    }

    loginSocial(network) {
        hellojs(network).login();
    }

    loginSocialCallback(auth) {
        return this.logins(AccountAPI.loginSocial.bind(AccountAPI), auth.authResponse.code);
    }

    logins() {
        let func = Array.prototype.shift.apply(arguments);

        AppDispatcher.dispatch({
            type: AccountConstants.LOGIN_REQUEST
        });
        return func(arguments).then(this._login_success_cb.bind(this),
            this._login_fail_cb.bind(this));
    }

    _login_success_cb(response) {
        this.setAccount(response.jwt);
    }

    _login_fail_cb(err, msg) {
        AppDispatcher.dispatch({
            type: AccountConstants.LOGIN_PROCESS,
            err: err,
            msg: msg
        });
    }

    logout() {
        AccountAPI.logout();
        this.resetAccount();
    }

    setAccount(jwt) {
        let savedJwt = localStorage.getItem('jwt');

        if (!jwt && !savedJwt) return;
        if (jwt && savedJwt && savedJwt !== jwt) {
            // TODO: add error message
            console.error("Error...");
            return;
        }

        jwt = jwt || savedJwt;
        AppDispatcher.dispatch({
            type: AccountConstants.LOGIN_PROCESS,
            jwt: jwt
        });

        if (!savedJwt) {
            let nextPath = RouterContainer.get().getCurrentQuery().nextPath || '/';

            RouterContainer.get().transitionTo(nextPath);
            localStorage.setItem('jwt', jwt);
        }
    }

    resetAccount() {
        localStorage.removeItem('jwt');
        AppDispatcher.dispatch({
            type: AccountConstants.LOGOUT_PROCESS
        });
    }
}

export default new AccountAction();
