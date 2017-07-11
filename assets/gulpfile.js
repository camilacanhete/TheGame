// Compile Sass Function
var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('styles', function(){
  gulp.src(['scss/main.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('css/'))
});

// Minify css Function and show sourcemaps
var gulp = require('gulp');
var cleanCSS = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');

gulp.task('minify-css', function() {
    return gulp.src(['css/*.css', '!css/*.min.css'])
        .pipe(sourcemaps.init())
        .pipe(cleanCSS())
        .pipe(sourcemaps.write())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('css'));
});

gulp.task('default', function(){
  gulp.watch("scss/**/*.scss", ['styles']);
});
