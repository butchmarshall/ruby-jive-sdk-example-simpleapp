var fs = require('fs'),
concat = require('gulp-concat'),
rename = require('gulp-rename'),
umd = require('gulp-umd'),
uglify = require('gulp-uglify'),
gulp = require('gulp');

gulp.task('default', [
  'minify'
]);

gulp.task('watch', function() {
	gulp.watch('./src/**/*', ['default']);
});

gulp.task('minify', function() {
	gulp.src([
		'./src/module.js',
		'./src/services/*.js'
	])
	.pipe(concat('angular-api-adapter.js'))
	.pipe(gulp.dest('./dist/'))
	.pipe(uglify())
	.pipe(rename('angular-api-adapter.min.js'))
	.pipe(gulp.dest('./dist/'));
});