import webpack       from 'webpack';
import webpackConfig from './_base';

webpackConfig.devtool = 'source-map';

webpackConfig.plugins.push(
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoEmitOnErrorsPlugin()
);

export default webpackConfig;
