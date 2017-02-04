import React from 'react';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import ReactMixin from 'react-mixin';

import AccountAction from '../actions/Account'


export default class Login extends React.Component {

    constructor() {
        super();
        this.state = {
            username: '',
            password: ''
        };
    }

    loginSocial(network) {
        function _login(e) {
            e.preventDefault();
            AccountAction.loginSocial(network);
        }
        return _login;
    }

    login(e) {
        e.preventDefault();
        //AccountAction.login(this.state.username, this.state.password)
        //    .then(null, function(err) {
        //        alert("There's an error logging in");
        //        console.log("Error logging in", err);
        //    });
    }

    render() {
        return (
            <div className="login jumbotron center-block">
                <h1>Login</h1>
                <form role="form">
                    <div className="form-group">
                        <input type="text" valueLink={this.linkState('user')} className="form-control" id="username" placeholder="Username" />
                    </div>
                    <div className="form-group">
                        <input type="password" valueLink={this.linkState('password')} className="form-control" id="password" ref="password" placeholder="Password" />
                    </div>
                    <div className="form-group">
                        <button type="submit" className="btn btn-default" onClick={this.login.bind(this)}>Submit</button>
                    </div>
                    <div className="form-group">
                        <button onClick={this.loginSocial("facebook")} className="zocial icon facebook"></button>
                        <button onClick={this.loginSocial("twitter")} className="zocial icon twitter"></button>
                        <button onClick={this.loginSocial("github")} className="zocial icon github"></button>
                        <button onClick={this.loginSocial("googleplus")} className="zocial icon googleplus"></button>
                    </div>
                </form>
        </div>
        );
    }
}

ReactMixin(Login.prototype, LinkedStateMixin);
