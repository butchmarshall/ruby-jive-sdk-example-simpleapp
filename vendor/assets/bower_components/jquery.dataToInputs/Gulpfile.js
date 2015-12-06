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
	.pipe(concat('jquery.dataToInputs.js'))
	.pipe(umd({
		dependencies: function() {
			return [
				{
					name: 'jquery'
				}
			]
		},
		exports: function() {
			return 'jQuery.dataToInputs';
		},
		namespace: function() {
			return 'jQuery.dataToInputs';
		}
	}))
	.pipe(gulp.dest('./dist/'))
	.pipe(uglify())
	.pipe(rename('jquery.dataToInputs.min.js'))
	.pipe(gulp.dest('./dist/'));
});