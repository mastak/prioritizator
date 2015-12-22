import AccountConstants from '../constants/Account';
import AccountAPI from '../api/Account';
import AppDispatcher from '../dispatchers/AppDispatcher';
import RouterContainer from '../libs/RouterContainer'


export default {
  loginSocial: (code) => {
    AppDispatcher.dispatch({
      type: AccountConstants.LOGIN_REQUEST,
      code: code
    });

    AccountAPI.loginSocial(code).then(function(response) {
      this.setAccount(response.jwt);
    }.bind(this), function (err, msg) {
      //console.error(msg); TODO: move err hndl to all requsts
      AppDispatcher.dispatch({
        type: AccountConstants.LOGIN_PROCESS,
        err: err,
        msg: msg
      });
    });
  },

  logout: () => {
    AccountAPI.logout();
    this.resetAccount();
  },

  setAccount: (jwt) => {
    let savedJwt = localStorage.getItem('jwt');

    if (!jwt && !savedJwt) return;
    if (jwt && savedJwt && savedJwt !== jwt) {
      // TODO: add error  message
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
  },
  resetAccount: () => {
    localStorage.removeItem('jwt');
    AppDispatcher.dispatch({
      type: AccountConstants.LOGOUT_PROCESS
    });
  }
}
