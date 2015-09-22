var gulp = require('gulp');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var uglify = require('gulp-uglify');
var through2 = require('through2');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var express = require('express');
var app = express();
var open = require("open");

gulp.task('uglify', function() {
    gulp.src('./src/*.js')
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest('./dist'))
    gulp.src('./src/*.js')
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest('./test'))
})

gulp.task('watch', function() {
    gulp.watch('src/i.js', ['uglify']);
});

gulp.task('test', function() {
	app.use(express.static('test'));

	var server = app.listen(3000, function () {
	  var host = server.address().address;
	  var port = server.address().port;

	  console.log('Demo server listening at http://localhost:'+port);
	  open("http://localhost:"+port);
	});

	gulp.watch('src/i.js', ['uglify']);

})

gulp.task('default', ['watch'])