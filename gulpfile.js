'use strict';

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var htmlreplace = require('gulp-html-replace');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var streamify = require('gulp-streamify');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var rename = require("gulp-rename");
var babelify = require('babelify');
var sass = require('gulp-sass');
var concatCss = require('gulp-concat-css');
var livereload = require('gulp-livereload');
var exec = require('child_process').exec;

function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);
  this.emit('end'); // Keep gulp from hanging on this task
}

function buildWatchScript(file) {

  var props = {
    entries: [file],
    debug : true,
    transform: [reactify, babelify]
  };

  var bundler = watchify(browserify(props));

  function rebundle() {
    var stream = bundler.bundle();
    return stream
      .on('error', handleErrors)
      .pipe(source(file))
      .pipe(rename("bundle.js"))
      .pipe(gulp.dest('./build/'))
      .pipe(livereload());
  }

  bundler.on('update', function() {
    rebundle();
    gutil.log('Rebundle...');
  });

  return rebundle();
}

gulp.task('server', function (cb) {
  exec('node server.js', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('sass', function() {
    return gulp.src('css/scss/*.scss')
        .pipe(sass())
        .pipe(concatCss('style.css'))
        .pipe(gulp.dest('./build/'))
        .pipe(livereload());
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch('css/scss/*.scss', ['sass']);
  return buildWatchScript('js/app.js');
});

gulp.task('default', ['server', 'watch', 'sass']);


//
//FUNCTION FOR PROD
//IT IS CURRENTLY NOT OFFICALLY SUPPORTED
//

function buildProdScript(file) {

  var props = {
    entries: [file],
    debug : true,
    transform: [reactify, babelify]
  };

  var bundler = browserify(props);

  function rebundle() {
    var stream = bundler.bundle();
    return stream
      .on('error', handleErrors)
      .pipe(source(file))
      .pipe(streamify(uglify()))
      .pipe(rename("bundle.min.js"))
      .pipe(gulp.dest('./build/'));
  }

  return rebundle();
}


