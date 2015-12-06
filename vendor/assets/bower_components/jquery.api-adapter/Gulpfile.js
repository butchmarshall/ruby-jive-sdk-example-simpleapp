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
		'./src/*.js'
	])
	.pipe(concat('jquery.api-adapter.js'))
	.pipe(umd({
		dependencies: function() {
			return [
				{
					name: 'jquery'
				}
			]
		},
		exports: function() {
			return 'jQuery.Api';
		},
		namespace: function() {
			return 'jQuery.Api';
		}
	}))
	.pipe(gulp.dest('./dist/'))
	.pipe(uglify())
	.pipe(rename('jquery.api-adapter.min.js'))
	.pipe(gulp.dest('./dist/'));
});