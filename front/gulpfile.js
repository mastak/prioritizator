var argv = require('yargs').argv,
    gulp = require('gulp'),
    gulpif = require('gulp-if'),
    del = require('del'),
    browserSync = require('browser-sync').create(),
    webpack = require('webpack-stream'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    stylus = require('gulp-stylus'),
    cssMin = require('gulp-minify-css'),
    nib = require('nib'),
    es = require('event-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    browserify = require('browserify'),
    sourceStream = require('vinyl-source-stream'),
    rename = require('gulp-rename'),
    buffer = require('vinyl-buffer'),
    rework = require('gulp-rework'),
    bootstrap = require('bootstrap-styl'),
    runSequence = require('run-sequence');

var buildDir = './build',
    buildDirJS = buildDir + '/js/',
    buildDirCSS = buildDir + '/css/',
    isServe = false;


// Concatenate & Minify JS
gulp.task('scripts', function() {
    var b = browserify({
        entries: './src/scripts/main.jsx',
        extensions: ['.js', '.jsx'],
        debug: true
    });

    return b.bundle()
        .pipe(sourceStream('app.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(gulpif(argv.prod, uglify()))
        .pipe(gulpif(argv.prod, rename({suffix: '.min'})))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(buildDirJS))
        .pipe(gulpif(isServe, browserSync.reload({ stream:true })));
});


// Compile our Styl
gulp.task('styles', function() {
    return gulp.src([
        './src/styles/*.styl'
    ])
    .pipe(stylus({use: [nib(), bootstrap()]}))
    .pipe(concat('style.css'))
    .pipe(gulpif(argv.prod, cssMin()))
    .pipe(gulpif(argv.prod, rename({suffix: '.min'})))
    .pipe(gulp.dest(buildDirCSS))
    .pipe(gulpif(isServe, browserSync.reload({ stream:true })));
});


// Copy other stuff
gulp.task('stuff', function() {
    return gulp.src([
        './src/**/*',
        '!./src/scripts/**/*.{js,jsx}',
        '!./src/styles/**/*.styl'
    ])
    .pipe(filterEmptyDirs())
    .pipe(gulp.dest(buildDir))
    .pipe(gulpif(isServe, browserSync.reload({ stream:true })));
});


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


//cleans build folder
gulp.task('clean', function() {
    return del(['build/**', '!build', '!build/.keep']);
});


gulp.task('build', function() {
    runSequence('clean', ['stuff', 'scripts', 'styles']);
});


gulp.task('default', ['build']);


gulp.task('watch', ['build'], function() {
    gulp.watch(['./src/scripts/**/*.js', './src/scripts/**/*.jsx'], ['scripts']);

    gulp.watch('./src/styles/**/*.styl', ['styles']);

    gulp.watch([
        './src/**/*',
        '!./src/scripts/**/*.js',
        '!./src/scripts/**/*.jsx',
        '!./src/styles/**/*.styl'
    ], ['stuff']);
});


gulp.task('serve', ['watch'], function() {
    isServe = true;
    browserSync.init({
        baseDir: "build",
        serveStatic: [buildDir],
        server: true,
        logLevel: "debug",
        logConnections: true,
        open: false
        // notify: false
    });
});
