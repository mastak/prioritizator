import webpack           from 'webpack';
import webpackConfig     from './_base';

webpackConfig.plugins.push(
  new webpack.optimize.UglifyJsPlugin({
    compress : {
      'unused'    : true,
      'dead_code' : true
    }
  })
);

export default webpackConfig;
