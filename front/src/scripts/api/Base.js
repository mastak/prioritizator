import request from 'reqwest';

import AccountStore from '../stores/Account';
import CommonConstants from '../constants/Common';


export default class BaseAPI {

    request(options) {
        options = Object.assign({
            crossOrigin: true,
            type: 'json',
            headers: this.common_headers
        }, options);

        return request(options).then(null, function (err, msg) {
            console.error(msg);
        });
    }

    get common_headers() {
        let headers = {},
            jwt = AccountStore.jwt;

        if (jwt) {
            headers[CommonConstants.AUTH_HEADER] = AccountStore.jwt;    // TODO:
        }
        return headers;
    }

    post(options) {
        options = Object.assign({}, options, {method: 'POST'});
        return this.request(options);
    }

    get(options) {
        options = Object.assign({}, options, {method: 'GET'});
        return this.request(options);
    }
}
