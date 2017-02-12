require('babel-register');

const config   = require('./config');
const env = config.default.get('env');  // TOOD: should be config.get('env')

module.exports = require('./config/envs/webpack/' + env);
