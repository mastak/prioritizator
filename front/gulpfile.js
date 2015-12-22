var gulp = require('gulp'),
  gulpif = require('gulp-if'),
  clean = require('del'),
  browserSync = require('browser-sync'),
  reloadMe = require('browser-sync').reload,
  //imageMin = require('gulp-imagemin'),
  webpack = require('webpack-stream'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  stylus = require('gulp-stylus'),
  cssMin = require('gulp-minify-css'),
  nib = require('nib'),
  es = require('event-stream'),
  merge = require('event-stream').concat;

var buildDir = './build';
  //publicAssetsDir = './build/assets';

var webpackAppJS = function(minifyMe) {
  return gulp.src('./src/scripts/main.jsx')
    .pipe(webpack({
      module: {
        loaders: [
          { test: /\.jsx$/, loader: 'jsx-loader?insertPragma=React.DOM' }
        ]
      },
      resolve: {
        extensions: ['', '.js', '.jsx']
      }
    }))
    .pipe(concat('app.js'))
    .pipe(gulpif(minifyMe, uglify()))
    .pipe(gulp.dest(buildDir));
};

var concatCSS = function(minifyMe) {
  return gulp.src([
    './src/styles/**/*.styl'
  ])
  .pipe(stylus({use: [nib()]}))
  .pipe(concat('style.css'))
  .pipe(gulpif(minifyMe, cssMin()))
  .pipe(gulp.dest(buildDir))
  .pipe(reloadMe({stream:true}));
};

var copyStuff = function(minifyMe) {
  return gulp.src([
    './src/**/*',
    '!./src/scripts/**/*.{js,jsx}',
    '!./src/styles/**/*.styl'
  ])
  .pipe(filterEmptyDirs())
  .pipe(gulp.dest(buildDir));
};

//removes empty dirs from stream
var filterEmptyDirs = function() {
  return es.map(function (file, cb) {
    if (file.stat.isFile()) {
      return cb(null, file);
    } else {
      return cb();
    }
  });
};

//var minifyImages = function() {
//  return gulp.src([
//    publicAssetsDir+"/**/*"
//  ])
//  .pipe(imageMin())
//  .pipe(gulp.dest(publicAssetsDir));
//};

//opens up browserSync url
var syncMe = function() {
  browserSync({
    proxy: "localhost:8888",
    open: false
    // notify: false
  });
};

//cleans build folder
gulp.task('clean', function() {
  //return gulp.src(buildDir, {read: false}).pipe(clean());
  return gulp.task('clean', function() {
    return del([buildDir]);
  });

});

//build + watching, for development
gulp.task('default', ['clean'], function() {

  gulp.watch(['./src/scripts/**/*.js', './src/scripts/**/*.jsx'], function() {
    console.log("File change - webpackAppJS()");
    webpackAppJS()
    .pipe(reloadMe({stream:true}));
  });

  gulp.watch('./src/styles/**/*.styl', function() {
    console.log("File change - concatCSS()");
    concatCSS();
  });

  gulp.watch([
      './src/**/*',
      '!./src/scripts/**/*.js',
      '!./src/scripts/**/*.jsx',
      '!./src/styles/**/*.styl'
  ], function() {
    console.log("File change - copyStuff()");
    copyStuff()
    .pipe(reloadMe({stream:true}));
  });

  return merge(copyStuff(), concatCSS(), webpackAppJS())
  .on("end", function() {
    syncMe();
  });
});

//production build task
gulp.task('build', ['clean'], function() {
  return merge(copyStuff(), webpackAppJS(true), concatCSS(true));
  //.on("end", function() {
  //  minifyImages();
  //});
});
