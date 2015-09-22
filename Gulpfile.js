var gulp = require('gulp');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var uglify = require('gulp-uglify');
var through2 = require('through2');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");

gulp.task('uglify', function() {
    gulp.src('./src/*.js')
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest('./dist'))
})

gulp.task('watch', function() {
    gulp.watch('src/i.js', ['uglify']);
});

gulp.task('default', ['watch'])