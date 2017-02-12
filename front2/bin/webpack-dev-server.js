require('babel-register');

const devServer = require('../config/envs/webpack-dev-server').default;
const config    = require('../config').default;

const host = config.get('webpack_host');
const port = config.get('webpack_port');
devServer.listen(port, host, function () {
  console.log(`Webpack dev server running at ${host}: ${port}`); // eslint-disable-line
});
