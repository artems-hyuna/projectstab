var gulp = require('gulp');
var panini = require('panini');
var del = require('del');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var cache = require('gulp-cache');
var image = require('gulp-image');
var browserSync = require('browser-sync').create();

var browsers = ['last 2 versions', 'ie >= 9', 'and_chr >= 2.3'];

var jsConcat = [
    'node_modules/foundation-sites/vendor/jquery/dist/jquery.min.js',
    // 'node_modules/foundation-sites/js/foundation.core.js',
    // 'node_modules/foundation-sites/js/foundation.util.mediaQuery.js',
    // 'node_modules/foundation-sites/js/foundation.util.timerAndImageLoader.js',
    // 'node_modules/foundation-sites/js/foundation.equalizer.js',
    'assets/js/project.js'
];

gulp.task('scss', function () {
    return gulp.src('assets/scss/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({includePaths: ['node_modules/foundation-sites/scss/'], outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(sourcemaps.write({includeContent: false}))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(autoprefixer({
            browsers: browsers
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/css'))
        .pipe(browserSync.stream());
});

gulp.task('scss_build', function () {
    return gulp.src('assets/scss/*.scss')
        .pipe(sass({includePaths: ['node_modules/foundation-sites/scss/'], outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: browsers
        }))
        .pipe(gulp.dest('public/css'))
        .pipe(browserSync.stream());
});

gulp.task('html',function () {
    panini.refresh();
    gulp.src('assets/html/pages/**/*.html')
        .pipe(panini({
            root: 'assets/html/pages/',
            layouts: 'assets/html/layouts/',
            partials: 'assets/html/partials/',
            data: 'assets/html/data/',
            helpers: 'assets/html/helpers/'
        }))
        .pipe(gulp.dest('public/'))
        .pipe(browserSync.stream());
});

gulp.task('fonts', function () {
   gulp.src('assets/fonts/*')
       .pipe(gulp.dest('public/fonts/'))
       .pipe(browserSync.stream());
});

gulp.task('js', function () {
    return gulp.src(jsConcat)
        .pipe(concat('app.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('public/js/'))
        .pipe(browserSync.stream());
});

gulp.task('images', function () {
    gulp.src('assets/images/*')
        .pipe(cache(image({
            pngquant: true,
            optipng: true,
            zopflipng: true,
            jpegRecompress: true,
            jpegoptim: true,
            mozjpeg: true,
            gifsicle: true,
            svgo: true,
            concurrent: 10
        })))
        .pipe(gulp.dest('public/images/'))
        .pipe(browserSync.stream());
});

//Clean
gulp.task('clean', function () {
    del.sync(['public/**', '!public']);
});

//browser-sync
gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: "public/"
        },
        notify: false
    });
    gulp.watch('assets/scss/*.scss', ['scss']);
    gulp.watch('assets/css/*.css', ['css']);
    gulp.watch('assets/html/**/*.html', ['html']);
    gulp.watch('assets/js/*.js', ['js'], function (done) {
        browserSync.reload();
        done();
    });
    gulp.watch('assets/images/*', ['images']);
});

//Default
gulp.task('default', ['compile', 'browser-sync']);

//Compile
gulp.task('compile', ['clean', 'scss', 'fonts', 'js', 'images', 'html']);

//Build
gulp.task('build', ['clean', 'scss_build', 'fonts', 'js', 'images', 'html']);
