/**
 *
 * Fork of HelloJS as client of implicit oauth2 lib
 * @author Igor Lubimov
 *
 * @hello.js
 *
 * HelloJS is a client side Javascript SDK for making OAuth2 logins and subsequent REST calls.
 *
 * @author Andrew Dodson
 * @website https://adodson.com/hello.js/
 *
 * @copyright Andrew Dodson, 2012 - 2015
 * @license MIT: You are free to use and modify this code for any use, on the condition that this copyright notice remains.
 */

var hello = function(name) {
    return hello.use(name);
};

hello.utils = {

    // Extend the first object with the properties and methods of the second
    extend: function(r /*, a[, b[, ...]] */) {

        // Get the arguments as an array but ommit the initial item
        Array.prototype.slice.call(arguments, 1).forEach(function(a) {
            if (r instanceof Object && a instanceof Object && r !== a) {
                for (var x in a) {
                    r[x] = hello.utils.extend(r[x], a[x]);
                }
            }
            else {
                r = a;
            }
        });

        return r;
    }
};

// Core library
hello.utils.extend(hello, {

    settings: {

        // OAuth2 authentication defaults
        redirect_uri: window.location.href.split('#')[0],
        response_type: 'code',
        display: 'popup',
        state: '',

        // API timeout in milliseconds
        timeout: 20000,

        // Popup Options
        popup: {
            resizable: 1,
            scrollbars: 1,
            width: 500,
            height: 550
        },

        // Default service / network
        default_service: null,

        // Force authentication
        // When hello.login is fired.
        // (null): ignore current session expiry and continue with login
        // (true): ignore current session expiry and continue with login, ask for user to reauthenticate
        // (false): if the current session looks good for the request scopes return the current session.
        force: null,

        // Page URL
        // When 'display=page' this property defines where the users page should end up after redirect_uri
        // Ths could be problematic if the redirect_uri is indeed the final place,
        // Typically this circumvents the problem of the redirect_url being a dumb relay page.
        page_uri: window.location.href
    },

    // Service configuration objects
    services: {},

    // Use
    // Define a new instance of the HelloJS library with a default service
    use: function(service) {

        // Create self, which inherits from its parent
        var self = Object.create(this);

        // Inherit the prototype from its parent
        self.settings = Object.create(this.settings);

        // Define the default service
        if (service) {
            self.settings.default_service = service;
        }

        // Create an instance of Events
        self.utils.Event.call(self);

        return self;
    },

    // Initialize
    // Define the client_ids for the endpoint services
    // @param object o, contains a key value pair, service => clientId
    // @param object opts, contains a key value pair of options used for defining the authentication defaults
    // @param number timeout, timeout in seconds
    init: function(services, options) {
        console.log(services);
        var utils = this.utils;

        if (!services) {
            return this.services;
        }

        // Define provider credentials
        // Reformat the ID field
        for (var x in services) {if (services.hasOwnProperty(x)) {
            if (typeof (services[x]) !== 'object') {
                services[x] = {id: services[x]};
            }
        }}

        // Merge services if there already exists some
        utils.extend(this.services, services);

        // Format the incoming
        for (x in this.services) {
            if (this.services.hasOwnProperty(x)) {
                this.services[x].scope = this.services[x].scope || {};
            }
        }

        //
        // Update the default settings with this one.
        if (options) {
            utils.extend(this.settings, options);

            // Do this immediatly incase the browser changes the current path.
            if ('redirect_uri' in options) {
                this.settings.redirect_uri = utils.url(options.redirect_uri).href;
            }
        }

        return this;
    },

    // Login
    // Using the endpoint
    // @param network stringify       name to connect to
    // @param options object    (optional)  {display mode, is either none|popup(default)|page, scope: email,birthday,publish, .. }
    // @param callback  function  (optional)  fired on signin
    login: function() {

        // Create an object which inherits its parent as the prototype and constructs a new event chain.
        var _this = this;
        var utils = _this.utils;
        var error = utils.error;
        var promise = utils.Promise();

        // Get parameters
        var p = utils.args({network: 's', options: 'o', callback: 'f'}, arguments);

        // Local vars
        var url;

        // Get all the custom options and store to be appended to the querystring
        var qs = utils.diffKey(p.options, _this.settings);

        // Merge/override options with app defaults
        var opts = p.options = utils.merge(_this.settings, p.options || {});

        // Merge/override options with app defaults
        opts.popup = utils.merge(_this.settings.popup, p.options.popup || {});

        // Network
        p.network = p.network || _this.settings.default_service;

        // Bind callback to both reject and fulfill states
        promise.proxy.then(p.callback, p.callback);

        // Trigger an event on the global listener
        function emit(s, value) {
            hello.emit(s, value);
        }

        promise.proxy.then(emit.bind(this, 'auth.login auth'), emit.bind(this, 'auth.failed auth'));


        var provider = _this.services[p.network];

        // Create a global listener to capture events triggered out of scope
        var callbackId = utils.globalEvent(function(str) {

            // The responseHandler returns a string, lets save this locally
            var obj;

            if (str) {
                obj = JSON.parse(str);
            }
            else {
                obj = error('cancelled', 'The authentication was not completed');
            }

            // Handle these response using the local
            // Trigger on the parent
            if (!obj.error) {

                // Save on the parent window the new credentials
                // This fixes an IE10 bug i think... atleast it does for me.
                utils.store(obj.network, obj);

                // Fulfill a successful login
                promise.fulfill({
                    network: obj.network,
                    authResponse: obj
                });
            }
            else {
                // Reject a successful login
                promise.reject(obj);
            }
        });

        var redirectUri = utils.url(opts.redirect_uri).href;

        // May be a space-delimited list of multiple, complementary types
        var responseType = provider.oauth.response_type || opts.response_type;

        // Query string parameters, we may pass our own arguments to form the querystring
        p.qs = utils.merge(qs, {
            client_id: encodeURIComponent(provider.id),
            response_type: encodeURIComponent(responseType),
            redirect_uri: encodeURIComponent(redirectUri),
            display: opts.display,
            scope: 'basic',
            state: {
                client_id: provider.id,
                network: p.network,
                display: opts.display,
                callback: callbackId,
                state: opts.state,
                redirect_uri: redirectUri
            }
        });

        // Get current session for merging scopes, and for quick auth response
        var session = utils.store(p.network);

        // Scopes (authentication permisions)
        // Ensure this is a string - IE has a problem moving Arrays between windows
        // Append the setup scope
        var SCOPE_SPLIT = /[,\s]+/;
        var scope = (opts.scope || '').toString() + ',' + p.qs.scope;

        // Append scopes from a previous session.
        // This helps keep app credentials constant,
        // Avoiding having to keep tabs on what scopes are authorized
        if (session && 'scope' in session && session.scope instanceof String) {
            scope += ',' + session.scope;
        }

        // Convert scope to an Array
        // - easier to manipulate
        scope = scope.split(SCOPE_SPLIT);

        // Format remove duplicates and empty values
        scope = utils.unique(scope).filter(filterEmpty);

        // Save the the scopes to the state with the names that they were requested with.
        p.qs.state.scope = scope.join(',');

        // Map scopes to the providers naming convention
        scope = scope.map(function(item) {
            // Does this have a mapping?
            if (item in provider.scope) {
                return provider.scope[item];
            }
            else {
                // Loop through all services and determine whether the scope is generic
                for (var x in _this.services) {
                    var serviceScopes = _this.services[x].scope;
                    if (serviceScopes && item in serviceScopes) {
                        // Found an instance of this scope, so lets not assume its special
                        return '';
                    }
                }

                // This is a unique scope to this service so lets in it.
                return item;
            }

        });

        // Stringify and Arrayify so that double mapped scopes are given the chance to be formatted
        scope = scope.join(',').split(SCOPE_SPLIT);

        // Again...
        // Format remove duplicates and empty values
        scope = utils.unique(scope).filter(filterEmpty);

        // Join with the expected scope delimiter into a string
        p.qs.scope = scope.join(provider.scope_delim || ',');

        // Bespoke
        // Override login querystrings from auth_options
        if ('login' in provider && typeof (provider.login) === 'function') {
            // Format the paramaters according to the providers formatting function
            provider.login(p);
        }

        // Convert state to a string
        p.qs.state = encodeURIComponent(JSON.stringify(p.qs.state));

        url = utils.qs(provider.oauth.auth, p.qs, encodeFunction);


        // Triggering popup
        var popup = utils.popup(url, redirectUri, opts.popup);

        var timer = setInterval(function() {
            if (!popup || popup.closed) {
                clearInterval(timer);
                if (!promise.state) {

                    var response = error('cancelled', 'Login has been cancelled');

                    if (!popup) {
                        response = error('blocked', 'Popup was blocked');
                    }

                    response.network = p.network;

                    promise.reject(response);
                }
            }
        }, 100);
        return promise.proxy;

        function encodeFunction(s) {return s;}

        function filterEmpty(s) {return !!s;}
    },

    // Remove any data associated with a given service
    // @param string name of the service
    // @param function callback
    logout: function() {

        var _this = this;
        var utils = _this.utils;
        var error = utils.error;

        // Create a new promise
        var promise = utils.Promise();

        var p = utils.args({name:'s', options: 'o', callback: 'f'}, arguments);

        p.options = p.options || {};

        // Add callback to events
        promise.proxy.then(p.callback, p.callback);

        // Trigger an event on the global listener
        function emit(s, value) {
            hello.emit(s, value);
        }

        promise.proxy.then(emit.bind(this, 'auth.logout auth'), emit.bind(this, 'error'));

        // Network
        p.name = p.name || this.settings.default_service;
        p.authResponse = utils.store(p.name);

        if (p.name && !(p.name in _this.services)) {

            promise.reject(error('invalid_network', 'The network was unrecognized'));

        }
        else if (p.name && p.authResponse) {

            // Define the callback
            var callback = function(opts) {

                // Remove from the store
                utils.store(p.name, null);

                // Emit events by default
                promise.fulfill(hello.utils.merge({network:p.name}, opts || {}));
            };

            // Run an async operation to remove the users session
            var _opts = {};
            if (p.options.force) {
                var logout = _this.services[p.name].logout;
                if (logout) {
                    // Convert logout to URL string,
                    // If no string is returned, then this function will handle the logout async style
                    if (typeof (logout) === 'function') {
                        logout = logout(callback, p);
                    }

                    // If logout is a string then assume URL and open in iframe.
                    if (typeof (logout) === 'string') {
                        utils.iframe(logout);
                        _opts.force = null;
                        _opts.message = 'Logout success on providers site was indeterminate';
                    }
                    else if (logout === undefined) {
                        // The callback function will handle the response.
                        return promise.proxy;
                    }
                }
            }

            // Remove local credentials
            callback(_opts);
        }
        else {
            promise.reject(error('invalid_session', 'There was no session to remove'));
        }

        return promise.proxy;
    },

    // Events: placeholder for the events
    events: {}
});

// Core utilities
hello.utils.extend(hello.utils, {

    // Error
    error: function(code, message) {
        return {
            error: {
                code: code,
                message: message
            }
        };
    },

    // Append the querystring to a url
    // @param string url
    // @param object parameters
    qs: function(url, params, formatFunction) {

        if (params) {

            // Set default formatting function
            formatFunction = formatFunction || encodeURIComponent;

            // Override the items in the URL which already exist
            for (var x in params) {
                var str = '([\\?\\&])' + x + '=[^\\&]*';
                var reg = new RegExp(str);
                if (url.match(reg)) {
                    url = url.replace(reg, '$1' + x + '=' + formatFunction(params[x]));
                    delete params[x];
                }
            }
        }

        if (!this.isEmpty(params)) {
            return url + (url.indexOf('?') > -1 ? '&' : '?') + this.param(params, formatFunction);
        }

        return url;
    },

    // Param
    // Explode/encode the parameters of an URL string/object
    // @param string s, string to decode
    param: function(s, formatFunction) {
        var b;
        var a = {};
        var m;

        if (typeof (s) === 'string') {

            formatFunction = formatFunction || decodeURIComponent;

            m = s.replace(/^[\#\?]/, '').match(/([^=\/\&]+)=([^\&]+)/g);
            if (m) {
                for (var i = 0; i < m.length; i++) {
                    b = m[i].match(/([^=]+)=(.*)/);
                    a[b[1]] = formatFunction(b[2]);
                }
            }

            return a;
        }
        else {

            formatFunction = formatFunction || encodeURIComponent;

            var o = s;

            a = [];

            for (var x in o) {if (o.hasOwnProperty(x)) {
                if (o.hasOwnProperty(x)) {
                    a.push([x, o[x] === '?' ? '?' : formatFunction(o[x])].join('='));
                }
            }}

            return a.join('&');
        }
    },

    // Local storage facade
    store: (function() {

        var a = ['localStorage', 'sessionStorage'];
        var i = -1;
        var prefix = 'test';

        // Set LocalStorage
        var localStorage;

        while (a[++i]) {
            try {
                // In Chrome with cookies blocked, calling localStorage throws an error
                localStorage = window[a[i]];
                localStorage.setItem(prefix + i, i);
                localStorage.removeItem(prefix + i);
                break;
            }
            catch (e) {
                localStorage = null;
            }
        }

        if (!localStorage) {

            var cache = null;

            localStorage = {
                getItem: function(prop) {
                    prop = prop + '=';
                    var m = document.cookie.split(';');
                    for (var i = 0; i < m.length; i++) {
                        var _m = m[i].replace(/(^\s+|\s+$)/, '');
                        if (_m && _m.indexOf(prop) === 0) {
                            return _m.substr(prop.length);
                        }
                    }

                    return cache;
                },

                setItem: function(prop, value) {
                    cache = value;
                    document.cookie = prop + '=' + value;
                }
            };

            // Fill the cache up
            cache = localStorage.getItem('hello');
        }

        function get() {
            var json = {};
            try {
                json = JSON.parse(localStorage.getItem('hello')) || {};
            }
            catch (e) {}

            return json;
        }

        function set(json) {
            localStorage.setItem('hello', JSON.stringify(json));
        }

        // Check if the browser support local storage
        return function(name, value, days) {

            // Local storage
            var json = get();

            if (name && value === undefined) {
                return json[name] || null;
            }
            else if (name && value === null) {
                try {
                    delete json[name];
                }
                catch (e) {
                    json[name] = null;
                }
            }
            else if (name) {
                json[name] = value;
            }
            else {
                return json;
            }

            set(json);

            return json || null;
        };

    })(),

    // Create and Append new DOM elements
    // @param node string
    // @param attr object literal
    // @param dom/string
    append: function(node, attr, target) {

        var n = typeof (node) === 'string' ? document.createElement(node) : node;

        if (typeof (attr) === 'object') {
            if ('tagName' in attr) {
                target = attr;
            }
            else {
                for (var x in attr) {if (attr.hasOwnProperty(x)) {
                    if (typeof (attr[x]) === 'object') {
                        for (var y in attr[x]) {if (attr[x].hasOwnProperty(y)) {
                            n[x][y] = attr[x][y];
                        }}
                    }
                    else if (x === 'html') {
                        n.innerHTML = attr[x];
                    }

                    // IE doesn't like us setting methods with setAttribute
                    else if (!/^on/.test(x)) {
                        n.setAttribute(x, attr[x]);
                    }
                    else {
                        n[x] = attr[x];
                    }
                }}
            }
        }

        if (target === 'body') {
            (function self() {
                if (document.body) {
                    document.body.appendChild(n);
                }
                else {
                    setTimeout(self, 16);
                }
            })();
        }
        else if (typeof (target) === 'object') {
            target.appendChild(n);
        }
        else if (typeof (target) === 'string') {
            document.getElementsByTagName(target)[0].appendChild(n);
        }

        return n;
    },

    // An easy way to create a hidden iframe
    // @param string src
    iframe: function(src) {
        this.append('iframe', {src: src, style: {position:'absolute', left: '-1000px', bottom: 0, height: '1px', width: '1px'}}, 'body');
    },

    // Recursive merge two objects into one, second parameter overides the first
    // @param a array
    merge: function(/* Args: a, b, c, .. n */) {
        var args = Array.prototype.slice.call(arguments);
        args.unshift({});
        return this.extend.apply(null, args);
    },

    // Makes it easier to assign parameters, where some are optional
    // @param o object
    // @param a arguments
    args: function(o, args) {

        var p = {};
        var i = 0;
        var t = null;
        var x = null;

        // 'x' is the first key in the list of object parameters
        for (x in o) {if (o.hasOwnProperty(x)) {
            break;
        }}

        // Passing in hash object of arguments?
        // Where the first argument can't be an object
        if ((args.length === 1) && (typeof (args[0]) === 'object') && o[x] != 'o!') {

            // Could this object still belong to a property?
            // Check the object keys if they match any of the property keys
            for (x in args[0]) {if (o.hasOwnProperty(x)) {
                // Does this key exist in the property list?
                if (x in o) {
                    // Yes this key does exist so its most likely this function has been invoked with an object parameter
                    // Return first argument as the hash of all arguments
                    return args[0];
                }
            }}
        }

        // Else loop through and account for the missing ones.
        for (x in o) {if (o.hasOwnProperty(x)) {

            t = typeof (args[i]);

            if ((typeof (o[x]) === 'function' && o[x].test(args[i])) || (typeof (o[x]) === 'string' && (
            (o[x].indexOf('s') > -1 && t === 'string') ||
            (o[x].indexOf('o') > -1 && t === 'object') ||
            (o[x].indexOf('i') > -1 && t === 'number') ||
            (o[x].indexOf('a') > -1 && t === 'object') ||
            (o[x].indexOf('f') > -1 && t === 'function')
            ))
            ) {
                p[x] = args[i++];
            }

            else if (typeof (o[x]) === 'string' && o[x].indexOf('!') > -1) {
                return false;
            }
        }}

        return p;
    },

    // Returns a URL instance
    url: function(path) {

        // If the path is empty
        if (!path) {
            return window.location;
        }

        // Chrome and FireFox support new URL() to extract URL objects
        else if (window.URL && URL instanceof Function && URL.length !== 0) {
            return new URL(path, window.location);
        }

        // Ugly shim, it works!
        else {
            var a = document.createElement('a');
            a.href = path;
            return a.cloneNode(false);
        }
    },

    diff: function(a, b) {
        return b.filter(function(item) {
            return a.indexOf(item) === -1;
        });
    },

    // Get the different hash of properties unique to `a`, and not in `b`
    diffKey: function(a, b) {
        if (a || !b) {
            var r = {};
            for (var x in a) {
                // Does the property not exist?
                if (!(x in b)) {
                    r[x] = a[x];
                }
            }

            return r;
        }

        return a;
    },

    // Unique
    // Remove duplicate and null values from an array
    // @param a array
    unique: function(a) {
        if (!Array.isArray(a)) { return []; }

        return a.filter(function(item, index) {
            // Is this the first location of item
            return a.indexOf(item) === index;
        });
    },

    isEmpty: function(obj) {

        // Scalar
        if (!obj)
            return true;

        // Array
        if (Array.isArray(obj)) {
            return !obj.length;
        }
        else if (typeof (obj) === 'object') {
            // Object
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    return false;
                }
            }
        }

        return true;
    },

    //jscs:disable

    /*!
     **  Thenable -- Embeddable Minimum Strictly-Compliant Promises/A+ 1.1.1 Thenable
     **  Copyright (c) 2013-2014 Ralf S. Engelschall <http://engelschall.com>
     **  Licensed under The MIT License <http://opensource.org/licenses/MIT>
     **  Source-Code distributed on <http://github.com/rse/thenable>
     */
    Promise: (function(){
        /*  promise states [Promises/A+ 2.1]  */
        var STATE_PENDING   = 0;                                         /*  [Promises/A+ 2.1.1]  */
        var STATE_FULFILLED = 1;                                         /*  [Promises/A+ 2.1.2]  */
        var STATE_REJECTED  = 2;                                         /*  [Promises/A+ 2.1.3]  */

        /*  promise object constructor  */
        var api = function (executor) {
            /*  optionally support non-constructor/plain-function call  */
            if (!(this instanceof api))
                return new api(executor);

            /*  initialize object  */
            this.id           = "Thenable/1.0.6";
            this.state        = STATE_PENDING; /*  initial state  */
            this.fulfillValue = undefined;     /*  initial value  */     /*  [Promises/A+ 1.3, 2.1.2.2]  */
            this.rejectReason = undefined;     /*  initial reason */     /*  [Promises/A+ 1.5, 2.1.3.2]  */
            this.onFulfilled  = [];            /*  initial handlers  */
            this.onRejected   = [];            /*  initial handlers  */

            /*  provide optional information-hiding proxy  */
            this.proxy = {
                then: this.then.bind(this)
            };

            /*  support optional executor function  */
            if (typeof executor === "function")
                executor.call(this, this.fulfill.bind(this), this.reject.bind(this));
        };

        /*  promise API methods  */
        api.prototype = {
            /*  promise resolving methods  */
            fulfill: function (value) { return deliver(this, STATE_FULFILLED, "fulfillValue", value); },
            reject:  function (value) { return deliver(this, STATE_REJECTED,  "rejectReason", value); },

            /*  "The then Method" [Promises/A+ 1.1, 1.2, 2.2]  */
            then: function (onFulfilled, onRejected) {
                var curr = this;
                var next = new api();                                    /*  [Promises/A+ 2.2.7]  */
                curr.onFulfilled.push(
                    resolver(onFulfilled, next, "fulfill"));             /*  [Promises/A+ 2.2.2/2.2.6]  */
                curr.onRejected.push(
                    resolver(onRejected,  next, "reject" ));             /*  [Promises/A+ 2.2.3/2.2.6]  */
                execute(curr);
                return next.proxy;                                       /*  [Promises/A+ 2.2.7, 3.3]  */
            }
        };

        /*  deliver an action  */
        var deliver = function (curr, state, name, value) {
            if (curr.state === STATE_PENDING) {
                curr.state = state;                                      /*  [Promises/A+ 2.1.2.1, 2.1.3.1]  */
                curr[name] = value;                                      /*  [Promises/A+ 2.1.2.2, 2.1.3.2]  */
                execute(curr);
            }
            return curr;
        };

        /*  execute all handlers  */
        var execute = function (curr) {
            if (curr.state === STATE_FULFILLED)
                execute_handlers(curr, "onFulfilled", curr.fulfillValue);
            else if (curr.state === STATE_REJECTED)
                execute_handlers(curr, "onRejected",  curr.rejectReason);
        };

        /*  execute particular set of handlers  */
        var execute_handlers = function (curr, name, value) {
            /* global process: true */
            /* global setImmediate: true */
            /* global setTimeout: true */

            /*  short-circuit processing  */
            if (curr[name].length === 0)
                return;

            /*  iterate over all handlers, exactly once  */
            var handlers = curr[name];
            curr[name] = [];                                             /*  [Promises/A+ 2.2.2.3, 2.2.3.3]  */
            var func = function () {
                for (var i = 0; i < handlers.length; i++)
                    handlers[i](value);                                  /*  [Promises/A+ 2.2.5]  */
            };

            /*  execute procedure asynchronously  */                     /*  [Promises/A+ 2.2.4, 3.1]  */
            if (typeof process === "object" && typeof process.nextTick === "function")
                process.nextTick(func);
            else if (typeof setImmediate === "function")
                setImmediate(func);
            else
                setTimeout(func, 0);
        };

        /*  generate a resolver function  */
        var resolver = function (cb, next, method) {
            return function (value) {
                if (typeof cb !== "function")                            /*  [Promises/A+ 2.2.1, 2.2.7.3, 2.2.7.4]  */
                    next[method].call(next, value);                      /*  [Promises/A+ 2.2.7.3, 2.2.7.4]  */
                else {
                    var result;
                    try { result = cb(value); }                          /*  [Promises/A+ 2.2.2.1, 2.2.3.1, 2.2.5, 3.2]  */
                    catch (e) {
                        next.reject(e);                                  /*  [Promises/A+ 2.2.7.2]  */
                        return;
                    }
                    resolve(next, result);                               /*  [Promises/A+ 2.2.7.1]  */
                }
            };
        };

        /*  "Promise Resolution Procedure"  */                           /*  [Promises/A+ 2.3]  */
        var resolve = function (promise, x) {
            /*  sanity check arguments  */                               /*  [Promises/A+ 2.3.1]  */
            if (promise === x || promise.proxy === x) {
                promise.reject(new TypeError("cannot resolve promise with itself"));
                return;
            }

            /*  surgically check for a "then" method
                (mainly to just call the "getter" of "then" only once)  */
            var then;
            if ((typeof x === "object" && x !== null) || typeof x === "function") {
                try { then = x.then; }                                   /*  [Promises/A+ 2.3.3.1, 3.5]  */
                catch (e) {
                    promise.reject(e);                                   /*  [Promises/A+ 2.3.3.2]  */
                    return;
                }
            }

            /*  handle own Thenables    [Promises/A+ 2.3.2]
                and similar "thenables" [Promises/A+ 2.3.3]  */
            if (typeof then === "function") {
                var resolved = false;
                try {
                    /*  call retrieved "then" method */                  /*  [Promises/A+ 2.3.3.3]  */
                    then.call(x,
                        /*  resolvePromise  */                           /*  [Promises/A+ 2.3.3.3.1]  */
                        function (y) {
                            if (resolved) return; resolved = true;       /*  [Promises/A+ 2.3.3.3.3]  */
                            if (y === x)                                 /*  [Promises/A+ 3.6]  */
                                promise.reject(new TypeError("circular thenable chain"));
                            else
                                resolve(promise, y);
                        },

                        /*  rejectPromise  */                            /*  [Promises/A+ 2.3.3.3.2]  */
                        function (r) {
                            if (resolved) return; resolved = true;       /*  [Promises/A+ 2.3.3.3.3]  */
                            promise.reject(r);
                        }
                    );
                }
                catch (e) {
                    if (!resolved)                                       /*  [Promises/A+ 2.3.3.3.3]  */
                        promise.reject(e);                               /*  [Promises/A+ 2.3.3.3.4]  */
                }
                return;
            }

            /*  handle other values  */
            promise.fulfill(x);                                          /*  [Promises/A+ 2.3.4, 2.3.3.4]  */
        };

        /*  export API  */
        return api;
    })(),

    //jscs:enable

    // Event
    // A contructor superclass for adding event menthods, on, off, emit.
    Event: function() {

        var separator = /[\s\,]+/;

        // If this doesn't support getPrototype then we can't get prototype.events of the parent
        // So lets get the current instance events, and add those to a parent property
        this.parent = {
            events: this.events,
            findEvents: this.findEvents,
            parent: this.parent,
            utils: this.utils
        };

        this.events = {};

        // On, subscribe to events
        // @param evt   string
        // @param callback  function
        this.on = function(evt, callback) {

            if (callback && typeof (callback) === 'function') {
                var a = evt.split(separator);
                for (var i = 0; i < a.length; i++) {

                    // Has this event already been fired on this instance?
                    this.events[a[i]] = [callback].concat(this.events[a[i]] || []);
                }
            }

            return this;
        };

        // Off, unsubscribe to events
        // @param evt   string
        // @param callback  function
        this.off = function(evt, callback) {

            this.findEvents(evt, function(name, index) {
                if (!callback || this.events[name][index] === callback) {
                    this.events[name][index] = null;
                }
            });

            return this;
        };

        // Emit
        // Triggers any subscribed events
        this.emit = function(evt /*, data, ... */) {

            // Get arguments as an Array, knock off the first one
            var args = Array.prototype.slice.call(arguments, 1);
            args.push(evt);

            // Handler
            var handler = function(name, index) {

                // Replace the last property with the event name
                args[args.length - 1] = (name === '*' ? evt : name);

                // Trigger
                this.events[name][index].apply(this, args);
            };

            // Find the callbacks which match the condition and call
            var _this = this;
            while (_this && _this.findEvents) {

                // Find events which match
                _this.findEvents(evt + ',*', handler);
                _this = _this.parent;
            }

            return this;
        };

        //
        // Easy functions
        this.emitAfter = function() {
            var _this = this;
            var args = arguments;
            setTimeout(function() {
                _this.emit.apply(_this, args);
            }, 0);

            return this;
        };

        this.findEvents = function(evt, callback) {

            var a = evt.split(separator);

            for (var name in this.events) {if (this.events.hasOwnProperty(name)) {

                if (a.indexOf(name) > -1) {

                    for (var i = 0; i < this.events[name].length; i++) {

                        // Does the event handler exist?
                        if (this.events[name][i]) {
                            // Emit on the local instance of this
                            callback.call(this, name, i);
                        }
                    }
                }
            }}
        };

        return this;
    },

    // Global Events
    // Attach the callback to the window object
    // Return its unique reference
    globalEvent: function(callback, guid) {
        // If the guid has not been supplied then create a new one.
        guid = guid || '_hellojs_' + parseInt(Math.random() * 1e12, 10).toString(36);

        // Define the callback function
        window[guid] = function() {
            // Trigger the callback
            try {
                if (callback.apply(this, arguments)) {
                    delete window[guid];
                }
            }
            catch (e) {
                console.error(e);
            }
        };

        return guid;
    },

    // Trigger a clientside popup
    // This has been augmented to support PhoneGap
    popup: function(url, redirectUri, options) {

        var documentElement = document.documentElement;

        // Multi Screen Popup Positioning (http://stackoverflow.com/a/16861050)
        // Credit: http://www.xtf.dk/2011/08/center-new-popup-window-even-on.html
        // Fixes dual-screen position                         Most browsers      Firefox

        if (options.height) {
            var dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;
            var height = screen.height || window.innerHeight || documentElement.clientHeight;
            options.top = parseInt((height - options.height) / 2, 10) + dualScreenTop;
        }

        if (options.width) {
            var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
            var width = screen.width || window.innerWidth || documentElement.clientWidth;
            options.left = parseInt((width - options.width) / 2, 10) + dualScreenLeft;
        }

        // Convert options into an array
        var optionsArray = [];
        Object.keys(options).forEach(function(name) {
            var value = options[name];
            optionsArray.push(name + (value !== null ? '=' + value : ''));
        });

        // Create a function for reopening the popup, and assigning events to the new popup object
        // This is a fix whereby triggering the
        var open = function(url) {

            // Trigger callback
            var popup = window.open(
                url,
                '_blank',
                optionsArray.join(',')
            );

            // PhoneGap support
            // Add an event listener to listen to the change in the popup windows URL
            // This must appear before popup.focus();
            try {
                if (popup && popup.addEventListener) {

                    // Get the origin of the redirect URI

                    var a = hello.utils.url(redirectUri);
                    var redirectUriOrigin = a.origin || (a.protocol + '//' + a.hostname);

                    // Listen to changes in the InAppBrowser window

                    popup.addEventListener('loadstart', function(e) {

                        var url = e.url;

                        // Is this the path, as given by the redirectUri?
                        // Check the new URL agains the redirectUriOrigin.
                        // According to #63 a user could click 'cancel' in some dialog boxes ....
                        // The popup redirects to another page with the same origin, yet we still wish it to close.

                        if (url.indexOf(redirectUriOrigin) !== 0) {
                            return;
                        }

                        // Split appart the URL
                        var a = hello.utils.url(url);

                        // We dont have window operations on the popup so lets create some
                        // The location can be augmented in to a location object like so...

                        var _popup = {
                            location: {
                                // Change the location of the popup
                                assign: function(location) {

                                    // Unfourtunatly an app is may not change the location of a InAppBrowser window.
                                    // So to shim this, just open a new one.

                                    popup.addEventListener('exit', function() {

                                        // For some reason its failing to close the window if a new window opens too soon.

                                        setTimeout(function() {
                                            open(location);
                                        }, 1000);
                                    });
                                },

                                search: a.search,
                                hash: a.hash,
                                href: a.href
                            },
                            close: function() {
                                if (popup.close) {
                                    popup.close();
                                }
                            }
                        };

                        // Then this URL contains information which HelloJS must process
                        // URL string
                        // Window - any action such as window relocation goes here
                        // Opener - the parent window which opened this, aka this script

                        hello.utils.responseHandler(_popup, window);

                        // Always close the popup regardless of whether the hello.utils.responseHandler detects a state parameter or not in the querystring.
                        // Such situations might arise such as those in #63

                        _popup.close();

                    });
                }
            }
            catch (e) {}

            if (popup && popup.focus) {
                popup.focus();
            }

            return popup;
        };

        // Call the open() function with the initial path
        //
        // OAuth redirect, fixes URI fragments from being lost in Safari
        // (URI Fragments within 302 Location URI are lost over HTTPS)
        // Loading the redirect.html before triggering the OAuth Flow seems to fix it.
        //
        // Firefox  decodes URL fragments when calling location.hash.
        //  - This is bad if the value contains break points which are escaped
        //  - Hence the url must be encoded twice as it contains breakpoints.
        if (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
            url = redirectUri + '#oauth_redirect=' + encodeURIComponent(encodeURIComponent(url));
        }

        return open(url);
    },

    // OAuth and API response handler
    responseHandler: function(window, parent) {

        var _this = this;
        var p;
        var location = window.location;

        // Is this an auth relay message which needs to call the proxy?
        p = _this.param(location.search);

        // OAuth2 or OAuth1 server response?
        if (p && p.state && p.code) {
            var state = JSON.parse(p.state);
            state.code = p.code;
            authCallback(state, window, parent);

            return;
        }

        // Save session, from redirected authentication
        // #access_token has come in?
        //
        // FACEBOOK is returning auth errors within as a query_string... thats a stickler for consistency.
        // SoundCloud is the state in the querystring and the token in the hashtag, so we'll mix the two together

        p = _this.merge(_this.param(location.search || ''), _this.param(location.hash || ''));
        
        // OAuth redirect, fixes URI fragments from being lost in Safari
        // (URI Fragments within 302 Location URI are lost over HTTPS)
        // Loading the redirect.html before triggering the OAuth Flow seems to fix it.
        if ('oauth_redirect' in p) {
            location.assign(decodeURIComponent(p.oauth_redirect));
            return;
        }

        // Trigger a callback to authenticate
        function authCallback(obj, window, parent) {
            var cb = obj.callback;
            var network = obj.network;

            // Trigger the callback on the parent
            _this.store(network, obj);

            // Remove from session object
            if (parent && cb && cb in parent) {

                try {
                    delete obj.callback;
                }
                catch (e) {}

                // Update store
                _this.store(network, obj);

                // Call the globalEvent function on the parent
                // It's safer to pass back a string to the parent,
                // Rather than an object/array (better for IE8)
                var str = JSON.stringify(obj);

                try {
                    parent[cb](str);
                }
                catch (e) {
                    // Error thrown whilst executing parent callback
                }
            }

            closeWindow();
        }

        function closeWindow() {

            if (window.frameElement) {
                // Inside an iframe, remove from parent
                parent.document.body.removeChild(window.frameElement);
            }
            else {
                // Close this current window
                try {
                    window.close();
                }
                catch (e) {}

                // IOS bug wont let us close a popup if still loading
                if (window.addEventListener) {
                    window.addEventListener('load', function() {
                        window.close();
                    });
                }
            }

        }
    }
});

// Events
// Extend the hello object with its own event instance
hello.utils.Event.call(hello);

///////////////////////////////////
// Monitoring session state
// Check for session changes
///////////////////////////////////

(function(hello) {

    // Monitor for a change in state and fire
    var oldSessions = {};

    // Hash of expired tokens
    var expired = {};

    // Listen to other triggers to Auth events, use these to update this
    hello.on('auth.login, auth.logout', function(auth) {
        if (auth && typeof (auth) === 'object' && auth.network) {
            oldSessions[auth.network] = hello.utils.store(auth.network) || {};
        }
    });

    (function self() {

        var CURRENT_TIME = ((new Date()).getTime() / 1e3);
        var emit = function(eventName) {
            hello.emit('auth.' + eventName, {
                network: name,
                authResponse: session
            });
        };

        // Loop through the services
        for (var name in hello.services) {if (hello.services.hasOwnProperty(name)) {

            if (!hello.services[name].id) {
                // We haven't attached an ID so dont listen.
                continue;
            }

            // Get session
            var session = hello.utils.store(name) || {};
            var provider = hello.services[name];
            var oldSess = oldSessions[name] || {};

            // Listen for globalEvents that did not get triggered from the child
            if (session && 'callback' in session) {

                // To do remove from session object...
                var cb = session.callback;
                try {
                    delete session.callback;
                }
                catch (e) {}

                // Update store
                // Removing the callback
                hello.utils.store(name, session);

                // Emit global events
                try {
                    window[cb](session);
                }
                catch (e) {}
            }

            // Refresh token
            if (session && ('expires' in session) && session.expires < CURRENT_TIME) {

                // If auto refresh is possible
                // Either the browser supports
                var refresh = provider.refresh || session.refresh_token;

                // Has the refresh been run recently?
                if (refresh && (!(name in expired) || expired[name] < CURRENT_TIME)) {
                    // Try to resignin
                    hello.emit('notice', name + ' has expired trying to resignin');
                    hello.login(name, {display: 'none', force: false});

                    // Update expired, every 10 minutes
                    expired[name] = CURRENT_TIME + 600;
                }

                // Does this provider not support refresh
                else if (!refresh && !(name in expired)) {
                    // Label the event
                    emit('expired');
                    expired[name] = true;
                }

                // If session has expired then we dont want to store its value until it can be established that its been updated
                continue;
            }

            // Has session changed?
            else if (oldSess.access_token === session.access_token &&
            oldSess.expires === session.expires) {
                continue;
            }

            // Access_token has been removed
            else if (!session.access_token && oldSess.access_token) {
                emit('logout');
            }

            // Access_token has been created
            else if (session.access_token && !oldSess.access_token) {
                emit('login');
            }

            // Access_token has been updated
            else if (session.expires !== oldSess.expires) {
                emit('update');
            }

            // Updated stored session
            oldSessions[name] = session;

            // Remove the expired flags
            if (name in expired) {
                delete expired[name];
            }
        }}

        // Check error events
        setTimeout(self, 1000);
    })();

})(hello);

hello.utils.responseHandler(window, window.opener || window.parent);


export default hello;
